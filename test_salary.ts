import { calculateGrossToNet } from './src/services/salaryCalculator';

console.log('--- TEST 2026 ---');
const r2026 = calculateGrossToNet({
  grossIncome: 100000000,
  dependentCount: 1,
  region: 1,
  period: 'REGION_2026',
  insuranceMode: 'OFFICIAL',
  customInsuranceSalary: 0
});
consoleLogJSON(r2026);
function consoleLogJSON(data: any) {
    console.log(JSON.stringify(data, null, 2));
}


console.log('--- TEST 2024 ---');
const r2024 = calculateGrossToNet({
  grossIncome: 100000000,
  dependentCount: 1,
  region: 1,
  period: 'REGION_2024',
  insuranceMode: 'OFFICIAL',
  customInsuranceSalary: 0
});
consoleLogJSON(r2024);
