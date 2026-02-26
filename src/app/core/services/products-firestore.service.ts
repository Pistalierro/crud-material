import {EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc} from '@angular/fire/firestore';
import {CreateProductDto, UpdateProductDto} from '../models/product-dto.model';
import {Product} from '../models/product.model';
import {map, Observable} from 'rxjs';
import {Timestamp} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',

})
export class ProductsFirestoreService {

  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly collectionName = 'products';

  async addProduct(dto: CreateProductDto): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const productsCollection = collection(this.firestore, this.collectionName);
      const docRef = await addDoc(productsCollection, dto);
      return docRef.id;
    });
  }

  getProducts(): Observable<Product[]> {
    return runInInjectionContext(this.injector, () => {
      const productsCollection = collection(this.firestore, this.collectionName);
      return collectionData(productsCollection, {idField: 'id'}).pipe(
        map((docs) => docs.map((doc) => {
          const product = doc as Product & { startDate: Date | Timestamp };
          return {
            ...product,
            startDate:
              product.startDate instanceof Timestamp ? product.startDate.toDate() : product.startDate,
          };
        }))
      );
    });
  }

  deleteProduct(id: string): Promise<void> {
    return runInInjectionContext(this.injector, () => {
      const productDocRef = doc(this.firestore, this.collectionName, id);
      return deleteDoc(productDocRef);
    });
  }

  updateProduct(id: string, dto: UpdateProductDto): Promise<void> {
    return runInInjectionContext(this.injector, () => {
      const productDocRef = doc(this.firestore, this.collectionName, id);
      return updateDoc(productDocRef, dto);
    });
  }
}
