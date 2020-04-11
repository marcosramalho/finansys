import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import {  switchMap } from 'rxjs/operators';

import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  public currentAction: string; // new or edit
  public categoryForm: FormGroup;
  public pageTitle: string;
  public serverErrorMessages: Array<string> = null;
  public submittedForm: boolean = false;
  public category: Category = new Category();


  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  public submitForm() {
    this.submittedForm = true;

    if (this.currentAction === "new") 
      this.createCategory();
    else 
      this.updateCategory();

  }

  // METHODS PRIVATE
  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === "new") 
      this.currentAction = "new";
    else 
      this.currentAction = "edit";
    
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    })
  }

  private loadCategory() {
    if (this.currentAction === "edit") {

      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get("id")))
      ).subscribe((category: Category) => {
        this.category = category;
        this.categoryForm.patchValue(category); // binds loadd category data to categoryForm
      }, (error) => alert("ocorreu um erro no servidor, tente mais tarde!"))
    }
  }

  private setPageTitle() {
    if (this.currentAction === "new") 
      this.pageTitle = "Cadastro de nova categoria"
    else 
      this.pageTitle = `Editando categoria: ${(this.category.name || "")}`
  }

  private updateCategory() {    
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.update(category).subscribe(
      category => this.actionsForSuccess(category),
      error => this.actionsForError(error)
    )
  }

  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.create(category).subscribe(
      category => this.actionsForSuccess(category),
      error => this.actionsForError(error)   
    )
  }

  private actionsForSuccess(category: Category) {
    toastr.success("Solicitação processada com sucesso");

    //redirect/reload component page
    this.router.navigateByUrl("categories", { skipLocationChange: true }).then(
      () => this.router.navigate(["categories", category.id, "edit"])
    )
  }

  private actionsForError(error) {
    toastr.error("Ocorreu um ao processar a sua solicitação!")

    this.submittedForm = false;

    if (error.status === 422) 
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else 
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
  }
}
