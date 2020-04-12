import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'categories', loadChildren: () => import('./pages/categories/categories.module').then(c => c.CategoriesModule) },
  { path: 'entries', loadChildren: () => import('./pages/entries/entries.module').then(c => c.EntriesModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
