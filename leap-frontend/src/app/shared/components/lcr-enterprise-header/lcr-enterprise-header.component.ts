import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'app-lcr-enterprise-header',
  standalone: true,
  template: `
    <div class="lcr-enterprise-header">
      <div class="header-title">Enterprise LCR</div>
      <div class="header-subtitle">(Amount in Billions CAD)</div>
    </div>
  `,
  styles: [`
    .lcr-enterprise-header {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding: 4px;
    }
    .header-title {
      font-weight: 700;
      font-size: 13px;
    }
    .header-subtitle {
      font-size: 11px;
      color: #666;
    }
  `]
})
export class LcrEnterpriseHeaderComponent implements IHeaderAngularComp {
  agInit(params: IHeaderParams): void {}
  refresh(params: IHeaderParams): boolean { return false; }
}
