import { Component, HostListener } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,   // <--- importante para standalone
  imports: [IonicModule, CommonModule, FormsModule]  // <--- precisa importar aqui
})
export class HomePage {
  display = '0';
  previousExpression = '';

  private firstOperand: number | null = null;
  private operator: string | null = null;
  private waitingForSecondOperand = false;

  // ===== Entrada via teclado =====
  @HostListener('window:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    const key = e.key;

    if (/^[0-9]$/.test(key)) { this.pressDigit(key); return; }
    if (key === '.' || key === ',') { this.pressDot(); return; }
    if (['+', '-', '*', '/'].includes(key)) { this.pressOperator(key); return; }
    if (key === 'Enter' || key === '=') { this.calculate(); return; }
    if (key === 'Backspace') { this.backspace(); return; }
    if (key.toLowerCase() === 'c') { this.clearAll(); return; }
  }

  // ===== Ações dos botões =====
  pressDigit(d: string) {
    if (this.waitingForSecondOperand) {
      this.display = d;
      this.waitingForSecondOperand = false;
    } else {
      this.display = this.display === '0' ? d : this.display + d;
    }
  }

  pressDot() {
    if (this.waitingForSecondOperand) {
      this.display = '0.';
      this.waitingForSecondOperand = false;
      return;
    }
    if (!this.display.includes('.')) {
      this.display += '.';
    }
  }

  pressOperator(op: string) {
    const inputValue = parseFloat(this.display);

    if (this.operator && this.waitingForSecondOperand) {
      this.operator = op;
      this.updatePreviousExpression();
      return;
    }

    if (this.firstOperand === null) {
      this.firstOperand = inputValue;
    } else if (this.operator) {
      const result = this.compute(this.firstOperand, inputValue, this.operator);
      this.display = this.formatResult(result);
      this.firstOperand = result;
    }

    this.operator = op;
    this.waitingForSecondOperand = true;
    this.updatePreviousExpression();
  }

  calculate() {
    if (this.firstOperand === null || !this.operator) return;

    const secondOperand = parseFloat(this.display);
    const result = this.compute(this.firstOperand, secondOperand, this.operator);

    this.display = this.formatResult(result);
    this.previousExpression = '';

    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
  }

  clearAll() {
    this.display = '0';
    this.previousExpression = '';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
  }

  backspace() {
    if (this.waitingForSecondOperand) return;
    this.display = this.display.length > 1 ? this.display.slice(0, -1) : '0';
  }

  toggleSign() {
    if (this.display === '0') return;
    this.display = this.display.startsWith('-') ? this.display.slice(1) : '-' + this.display;
  }

  percent() {
    const value = parseFloat(this.display);
    if (!isNaN(value)) {
      this.display = this.formatResult(value / 100);
    }
  }

  // ===== Utilitários =====
  private compute(a: number, b: number, op: string): number {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') {
      if (b === 0) return NaN;
      return a / b;
    }
    return b;
  }

  private formatResult(value: number): string {
    if (!isFinite(value)) return 'Erro';
    const num = parseFloat(value.toString());
    const fixed = Math.round(num * 1e12) / 1e12;
    return ('' + fixed).replace(/\.0+$/, '');
  }

  private updatePreviousExpression() {
    if (this.firstOperand !== null && this.operator !== null) {
      const symbol = this.operator === '*' ? '×' : this.operator === '/' ? '÷' : this.operator;
      this.previousExpression = `${this.formatResult(this.firstOperand)} ${symbol}`;
    }
  }
}
