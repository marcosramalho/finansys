import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';
import { Category } from './../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

import {  switchMap } from 'rxjs/operators';

import toastr from 'toastr';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.scss']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  public currentAction: string; // new or edit
  public entryForm: FormGroup;
  public pageTitle: string;
  public serverErrorMessages: Array<string> = null;
  public submittedForm: boolean = false;
  public entry: Entry = new Entry();
  public categories: Category[];

  public imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeperator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  }

  public ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  }

  constructor(
    private entryService: EntryService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {        
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }

  ngAfterContentChecked(): void {    
    this.setPageTitle();
  }

  public submitForm() {
    this.submittedForm = true;

    if (this.currentAction === "new") 
      this.createEntry();
    else 
      this.updateEntry();
  }

  public get typeOptions(): Array<any> {
    return  Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text: text,
          value: value
        }
      }
    )
  }

  // METHODS PRIVATE
  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === "new") 
      this.currentAction = "new";
    else 
      this.currentAction = "edit";
    
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: ["expense", [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: [null, [Validators.required]],
    })
  }

  private loadEntry() {
    if (this.currentAction === "edit") {

      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get("id")))
      ).subscribe((entry: Entry) => {
        this.entry = entry;
        this.entryForm.patchValue(entry); // binds loadd entry data to entryForm
      }, (error) => alert("ocorreu um erro no servidor, tente mais tarde!"))
    }
  }

  private loadCategories() {
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    )
  }

  private setPageTitle() {
    if (this.currentAction === "new") 
      this.pageTitle = "Cadastro de novo lançamento"
    else 
      this.pageTitle = `Editando lançamento: ${(this.entry.name || "")}`
  }

  private updateEntry() {    
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.update(entry).subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry).subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)   
    )
  }

  private actionsForSuccess(entry: Entry) {
    toastr.success("Solicitação processada com sucesso");

    //redirect/reload component page
    this.router.navigateByUrl("entries", { skipLocationChange: true }).then(
      () => this.router.navigate(["entries", entry.id, "edit"])
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
