import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { By } from '@angular/platform-browser';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the dialog when open() is called', () => {
    const nativeDialog = fixture.debugElement.query(By.css('dialog')).nativeElement;
    nativeDialog.showModal = jest.fn();

    component.open();

    expect(nativeDialog.showModal).toHaveBeenCalled();
  });

  it('should close the dialog when close() is called', () => {
    const nativeDialog = fixture.debugElement.query(By.css('dialog')).nativeElement;
    nativeDialog.close = jest.fn();

    component.close();

    expect(nativeDialog.close).toHaveBeenCalled();
  });

  it('should emit confirm event and close the dialog on confirm click', () => {
    const nativeDialog = fixture.debugElement.query(By.css('dialog')).nativeElement;
    nativeDialog.close = jest.fn();
    component.confirm.emit = jest.fn();

    component.onConfirmClick();

    expect(nativeDialog.close).toHaveBeenCalled();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should display the correct title and message', () => {
    component.title = 'Test Title';
    component.message = 'Test Message';
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
    const messageElement = fixture.debugElement.query(By.css('p')).nativeElement;

    expect(titleElement.textContent).toBe('Test Title');
    expect(messageElement.textContent).toBe('Test Message');
  });

  it('should display cancel and confirm buttons with correct text', () => {
    component.cancelText = 'No';
    component.confirmText = 'Yes';
    fixture.detectChanges();

    const cancelButton = fixture.debugElement.query(By.css('.btn-reset')).nativeElement;
    const confirmButton = fixture.debugElement.query(By.css('.btn-primary')).nativeElement;

    expect(cancelButton.textContent.trim()).toBe('No');
    expect(confirmButton.textContent.trim()).toBe('Yes');
  });

  it('should hide the cancel button if showCancel is false', () => {
    component.showCancel = false;
    fixture.detectChanges();

    const cancelButton = fixture.debugElement.query(By.css('.btn-reset'));
    expect(cancelButton).toBeNull();
  });
});
