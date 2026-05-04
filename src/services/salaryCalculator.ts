export type PeriodMode = 'REGION_2024' | 'REGION_2026';
export type InsuranceMode = 'OFFICIAL' | 'OTHER';

export interface SalaryParams {
  grossIncome: number;
  dependentCount: number;
  region: 1 | 2 | 3 | 4;
  period: PeriodMode;
  insuranceMode: InsuranceMode;
  customInsuranceSalary: number;
}

export interface TaxDetail {
  level: number;
  taxableAmount: number;
  rate: number;
  taxAmount: number;
}

export interface SalaryResult {
  grossIncome: number;
  netIncome: number;
  
  employeeInsurance: {
    bhxh: number;
    bhyt: number;
    bhtn: number;
    total: number;
  };
  
  employerInsurance: {
    bhxh: number;
    bhtnldBnn: number;
    bhyt: number;
    bhtn: number;
    total: number;
  };
  
  employerTotalCost: number;
  
  incomeBeforeTax: number;
  personalDeduction: number;
  dependentDeduction: number;
  totalDeduction: number;
  taxableIncome: number;
  
  taxDetails: TaxDetail[];
  personalIncomeTax: number;
  
  configUsed: {
    regionalMinimumSalary: number;
    baseSalaryCap: number;
    insuranceSalaryUsed: number;
  };
}

const BASE_SALARY = 2340000;

export const REGULATION_CONFIG = {
  REGION_2024: {
    personalDeduction: 11000000,
    dependentDeduction: 4400000,
    regionalMinSalaries: {
      1: 4960000,
      2: 4410000,
      3: 3860000,
      4: 3450000,
    },
    taxBrackets: [
      { max: 5000000, rate: 0.05 },
      { max: 10000000, rate: 0.10 },
      { max: 18000000, rate: 0.15 },
      { max: 32000000, rate: 0.20 },
      { max: 52000000, rate: 0.25 },
      { max: 80000000, rate: 0.30 },
      { max: Infinity, rate: 0.35 }
    ]
  },
  REGION_2026: {
    personalDeduction: 15500000,
    dependentDeduction: 6200000,
    regionalMinSalaries: {
      1: 5310000,
      2: 4730000,
      3: 4140000,
      4: 3700000,
    },
    taxBrackets: [
      { max: 10000000, rate: 0.05 },
      { max: 30000000, rate: 0.10 },
      { max: 60000000, rate: 0.20 },
      { max: 100000000, rate: 0.30 },
      { max: Infinity, rate: 0.35 }
    ]
  }
};

const calculateTax = (taxableIncome: number, brackets: {max: number, rate: number}[]): { total: number, details: TaxDetail[] } => {
  if (taxableIncome <= 0 || isNaN(taxableIncome)) return { total: 0, details: [] };

  let totalTax = 0;
  const details: TaxDetail[] = [];
  let remaining = taxableIncome;
  let prevMax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i];
    if (remaining <= 0) break;
    
    const currentRange = Math.min(b.max - prevMax, remaining);
    const taxInThisLevel = currentRange * b.rate;
    
    if (taxInThisLevel > 0) {
      details.push({
        level: i + 1,
        taxableAmount: currentRange,
        rate: b.rate * 100,
        taxAmount: Math.round(taxInThisLevel)
      });
    }
    
    totalTax += taxInThisLevel;
    remaining -= currentRange;
    prevMax = b.max;
  }

  return { total: Math.round(totalTax), details };
};

export const calculateGrossToNet = (params: SalaryParams): SalaryResult => {
  const { grossIncome, dependentCount, region, period, insuranceMode, customInsuranceSalary } = params;
  
  const config = REGULATION_CONFIG[period];
  const regionalMinimumSalary = config.regionalMinSalaries[region];
  const baseSalaryCap = BASE_SALARY * 20;
  const unemploymentCap = regionalMinimumSalary * 20;

  const insuranceSalary = insuranceMode === 'OFFICIAL' ? grossIncome : customInsuranceSalary;

  const bhxhBase = Math.min(insuranceSalary, baseSalaryCap);
  const bhytBase = Math.min(insuranceSalary, baseSalaryCap);
  const bhtnBase = Math.min(insuranceSalary, unemploymentCap);

  // Employee
  const empBhxh = Math.round(bhxhBase * 0.08);
  const empBhyt = Math.round(bhytBase * 0.015);
  const empBhtn = Math.round(bhtnBase * 0.01);
  const totalEmployeeInsurance = empBhxh + empBhyt + empBhtn;

  // Employer
  const erBhxh = Math.round(bhxhBase * 0.17);
  const erBhtnldBnn = Math.round(bhxhBase * 0.005);
  const erBhyt = Math.round(bhytBase * 0.03);
  const erBhtn = Math.round(bhtnBase * 0.01);
  const totalEmployerInsurance = erBhxh + erBhtnldBnn + erBhyt + erBhtn;
  
  const employerTotalCost = grossIncome + totalEmployerInsurance;

  const incomeBeforeTax = grossIncome - totalEmployeeInsurance;

  const personalDeduction = config.personalDeduction;
  const dependentDeduction = dependentCount * config.dependentDeduction;
  const totalDeduction = personalDeduction + dependentDeduction;

  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);
  
  const { total: personalIncomeTax, details: taxDetails } = calculateTax(taxableIncome, config.taxBrackets);
  
  const netIncome = incomeBeforeTax - personalIncomeTax;

  return {
    grossIncome: Math.round(grossIncome),
    netIncome: Math.round(netIncome),
    employeeInsurance: {
      bhxh: empBhxh,
      bhyt: empBhyt,
      bhtn: empBhtn,
      total: totalEmployeeInsurance
    },
    employerInsurance: {
      bhxh: erBhxh,
      bhtnldBnn: erBhtnldBnn,
      bhyt: erBhyt,
      bhtn: erBhtn,
      total: totalEmployerInsurance
    },
    employerTotalCost: Math.round(employerTotalCost),
    incomeBeforeTax: Math.round(incomeBeforeTax),
    personalDeduction,
    dependentDeduction,
    totalDeduction,
    taxableIncome: Math.round(taxableIncome),
    personalIncomeTax,
    taxDetails,
    configUsed: {
      regionalMinimumSalary,
      baseSalaryCap,
      insuranceSalaryUsed: insuranceSalary
    }
  };
};

export const calculateNetToGross = (params: Omit<SalaryParams, 'grossIncome'> & { targetNetIncome: number }): SalaryResult => {
  const { targetNetIncome, ...restParams } = params;
  
  let low = 0;
  let high = Math.max(targetNetIncome * 2, 100000000);
  
  // Dynamic upper bound expansion if needed
  let startTest = calculateGrossToNet({ grossIncome: high, ...restParams });
  while (startTest.netIncome < targetNetIncome) {
    high *= 2;
    startTest = calculateGrossToNet({ grossIncome: high, ...restParams });
  }

  let bestGross = targetNetIncome; // Fallback
  
  for (let i = 0; i < 100; i++) {
    const mid = Math.round((low + high) / 2);
    const test = calculateGrossToNet({ grossIncome: mid, ...restParams });
    
    if (test.netIncome === targetNetIncome) {
      bestGross = mid;
      break;
    } else if (test.netIncome < targetNetIncome) {
      low = mid;
    } else {
      high = mid;
    }
  }

  bestGross = Math.round((low + high) / 2);
  
  // Fine tune loop to find the exact +/- 1 match
  let result = calculateGrossToNet({ grossIncome: bestGross, ...restParams });
  
  if (result.netIncome < targetNetIncome) {
     while (result.netIncome < targetNetIncome) {
        bestGross++;
        result = calculateGrossToNet({ grossIncome: bestGross, ...restParams });
     }
  } else if (result.netIncome > targetNetIncome) {
      while (result.netIncome > targetNetIncome) {
        bestGross--;
        result = calculateGrossToNet({ grossIncome: bestGross, ...restParams });
        if (result.netIncome <= targetNetIncome) {
            // Need the first one that hits or exceeds to be closest? 
            // In general, pick the one strictly closest
            const diffA = Math.abs(targetNetIncome - result.netIncome);
            const diffB = Math.abs(targetNetIncome - calculateGrossToNet({ grossIncome: bestGross+1, ...restParams}).netIncome);
            if (diffB < diffA) bestGross++;
            break;
        }
      }
  }

  return calculateGrossToNet({ grossIncome: bestGross, ...restParams });
};
