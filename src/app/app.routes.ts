import { Routes } from '@angular/router';
import { FormComponent } from './pages/form/form.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'form',
        component: FormComponent,
    },
    {
        path: 'form/:id',
        component: FormComponent,
    }
];
