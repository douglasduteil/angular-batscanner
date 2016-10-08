import { Class as InjectableClass } from '@angular/core'

import { TaxRateService } from './tax-rate.service'

export const SalesTaxService = InjectableClass({
  constructor: [TaxRateService, function (rateService) {
    this.rateService = rateService
  }],

  getVAT (value) {
    let amount = (typeof value === 'string') ? parseFloat(value) : value
    return (amount || 0) * this.rateService.getRate('VAT')
  }
})
