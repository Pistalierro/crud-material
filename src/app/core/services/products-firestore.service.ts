import {EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  collectionGroup,
  collectionSnapshots,
  deleteDoc,
  doc,
  Firestore,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  updateDoc
} from '@angular/fire/firestore';
import {CreateProductDto, UpdateProductDto} from '../models/product-dto.model';
import {Auth, authState} from '@angular/fire/auth';
import {combineLatest, from, map, Observable, of, switchMap} from 'rxjs';
import {Product, ProductListItem} from '../models/product.model';

@Injectable({
  providedIn: 'root',

})
export class ProductsFirestoreService {

  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly auth = inject(Auth);

  async addProduct(dto: CreateProductDto): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const uid = this.getUidOrThrow();
      const admin = await this.isAdmin();

      if (admin) {
        const publicCollection = collection(this.firestore, 'catalogPublic');
        const docRef = await addDoc(publicCollection, dto);

        return docRef.id;
      }

      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 6 * 60 * 60 * 1000));
      const sandboxCollection = collection(this.firestore, `users/${uid}/sandboxProducts`);
      const docRef = await addDoc(sandboxCollection, {...dto, expiresAt});

      return docRef.id;
    });
  }

  getProducts(): Observable<ProductListItem[]> {
    return runInInjectionContext(this.injector, () =>
      authState(this.auth).pipe(
        switchMap((user) =>
          runInInjectionContext(this.injector, () => {
            const publicCollection = collection(this.firestore, 'catalogPublic');

            const publicProducts$ = collectionData(publicCollection, {idField: 'id'}).pipe(
              map((docs) =>
                docs.map((item) => this.toProductListItem(item, 'public', null)),
              ),
            );

            if (!user) {
              return combineLatest([publicProducts$, of([] as ProductListItem[])]).pipe(
                map(([publicProducts, sandboxProducts]) =>
                  [...publicProducts, ...sandboxProducts].sort(
                    (a, b) => b.startDate.getTime() - a.startDate.getTime(),
                  ),
                ),
              );
            }

            return from(user.getIdTokenResult()).pipe(
              switchMap((tokenResult) =>
                runInInjectionContext(this.injector, () => {
                  const admin = tokenResult.claims['admin'] === true;

                  const sandboxProducts$ = admin
                    ? collectionSnapshots(
                      query(collectionGroup(this.firestore, 'sandboxProducts')),
                    ).pipe(
                      map((docs) =>
                        docs.map((docSnapshot: QueryDocumentSnapshot) => {
                          const ownerUid = docSnapshot.ref.parent.parent?.id;

                          if (!ownerUid) {
                            throw new Error('Sandbox owner uid is missing');
                          }

                          return this.toProductListItem(
                            {
                              id: docSnapshot.id,
                              ...docSnapshot.data(),
                            },
                            'sandbox',
                            ownerUid,
                          );
                        }),
                      ),
                    )
                    : collectionData(
                      collection(this.firestore, `users/${user.uid}/sandboxProducts`),
                      {idField: 'id'},
                    ).pipe(
                      map((docs) =>
                        docs.map((item) =>
                          this.toProductListItem(item, 'sandbox', user.uid),
                        ),
                      ),
                    );

                  return combineLatest([publicProducts$, sandboxProducts$]).pipe(
                    map(([publicProducts, sandboxProducts]) =>
                      [...publicProducts, ...sandboxProducts].sort(
                        (a, b) => b.startDate.getTime() - a.startDate.getTime(),
                      ),
                    ),
                  );
                }),
              ),
            );
          }),
        ),
      ),
    );
  }

  async deleteProduct(
    id: string,
    source: ProductListItem['source'],
    ownerUid: ProductListItem['ownerUid'],
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const admin = await this.isAdmin();

      if (source === 'public') {
        if (!admin) {
          throw new Error('Only admin can delete public products');
        }

        const productDocRef = doc(this.firestore, `catalogPublic/${id}`);
        await deleteDoc(productDocRef);
        return;
      }

      const sandboxOwnerUid = admin ? ownerUid : this.getUidOrThrow();

      if (!sandboxOwnerUid) {
        throw new Error('Sandbox owner uid is required');
      }

      const productDocRef = doc(this.firestore, `users/${sandboxOwnerUid}/sandboxProducts/${id}`);
      await deleteDoc(productDocRef);
    });
  }


  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    source: ProductListItem['source'],
    ownerUid: ProductListItem['ownerUid'],
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const admin = await this.isAdmin();

      if (source === 'public') {
        if (!admin) {
          throw new Error('Only admin can update public products');
        }

        const productDocRef = doc(this.firestore, `catalogPublic/${id}`);
        await updateDoc(productDocRef, dto);
        return;
      }

      const sandboxOwnerUid = admin ? ownerUid : this.getUidOrThrow();

      if (!sandboxOwnerUid) {
        throw new Error('Sandbox owner uid is required');
      }

      const productDocRef = doc(this.firestore, `users/${sandboxOwnerUid}/sandboxProducts/${id}`);
      await updateDoc(productDocRef, dto);
    });
  }

  async isAdmin(): Promise<boolean> {
    await runInInjectionContext(this.injector, () => this.auth.authStateReady());
    const user = this.auth.currentUser;
    if (!user) return false;
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims['admin'] === true;
  }

  private getUidOrThrow(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('User is not authenticated yet');
    return uid;
  }

  private toProductListItem(
    item: unknown,
    source: ProductListItem['source'],
    ownerUid: string | null,
  ): ProductListItem {
    const product = item as Product & { startDate: Date | Timestamp };

    return {
      ...product,
      source,
      ownerUid,
      startDate:
        product.startDate instanceof Timestamp ? product.startDate.toDate() : product.startDate,
    };
  }
}
