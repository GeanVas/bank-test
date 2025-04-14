import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  @ViewChild('nativeDialog') nativeDialog!: ElementRef<HTMLDialogElement>;

  @Input() title = 'Confirm';
  @Input() message = '';
  @Input() showCancel = true;
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();

  open() {
    this.nativeDialog.nativeElement.showModal();
  }

  close() {
    this.nativeDialog.nativeElement.close();
  }

  onConfirmClick() {
    this.close();
    this.confirm.emit();
  }
}
