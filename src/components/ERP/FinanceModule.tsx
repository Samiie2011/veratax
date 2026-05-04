import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  DollarSign, 
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import ErpApiService from '../../services/ErpApiService';
import { auth } from '../../lib/firebase';

interface ContractRecord {
  id: string;
  stt: string;           // 1. STT
  groupKey: string;      // 2. Mã nhóm (Cột B)
  year: string;          // 3. Năm hợp đồng
  invoiceNo: string;     // 4. Số hóa đơn
  invoiceDate: string;   // 5. Ngày hóa đơn
  contractDate: string;  // 6. Ngày hợp đồng
  contractCode: string;  // 7. SỐ HĐ-XUẤT HÓA ĐƠN (Cột G)
  serviceType: string;   // 8. DV
  serviceDetail: string; // 9. Chi tiết DV
  referralName: string;  // 10. Người giới thiệu
  nature: string;        // 11. Tính chất người giới thiệu
  clientName: string;    // 12. Tên công ty
  abbreviation: string;  // 13. Viết tắt
  mst: string;           // 14. MST
  issuedDate: string;    // 15. Ngày cấp
  address: string;       // 16. Địa chỉ
  representative: string;// 17. Người đại diện
  position: string;      // 18. Chức vụ
  phone: string;         // 19. Điện thoại
  email: string;         // 20. Email
  accountNo: string;     // 21. Số tài khoản
  bankName: string;      // 22. Ngân hàng
  content: string;       // 23. Nội dung
  note: string;          // 24. Ghi chú
  appendix: string;      // 25. Phụ lục
  fee: number;           // 26. Phí
  unit: string;          // 27. DVT
  vat: number;           // 28. VAT
  total: number;         // 29. Tổng cộng
  paymentDate: string;   // 30. Ngày thu tiền
  fileReceivedDate: string; // 31. Ngày nhận hồ sơ
  fileSentDate: string;     // 32. Ngày gửi hồ sơ
  fileSignedDate: string;   // 33. Ngày ký hồ sơ (Cột AG - Map to 33)
  fileSubmittedDate: string;// 34. Ngày nộp hồ sơ
  resultReceivedDate: string;// 35. Ngày nhận kết quả
  isCompleted: boolean;     // 36. Hoàn thành (OK)
  
  // Custom fields for logic
  isOfficial: boolean;      // Hợp đồng chính thức (DV starts with HD)
  isContractMade: boolean;  // Đã làm hợp đồng (Màu xanh cột G)
  applyVat: boolean;        // Áp dụng VAT
  vatRate: number;          // VAT rate (0, 5, 8, 10 or -1 for "Không chịu thuế")
  managedBy: string;
}

const VAT_OPTIONS = [
  { label: 'Không chịu thuế', value: -1 },
  { label: '0%', value: 0 },
  { label: '5%', value: 5 },
  { label: '8%', value: 8 },
  { label: '10%', value: 10 },
];

const SERVICE_CATALOG = [
  { group: 'DỊCH VỤ TƯ VẤN PHÁP LÝ', items: [
    { code: 'HDPL', name: 'Hợp đồng pháp lý', detail: 'Tư vấn pháp lý doanh nghiệp' },
    { code: 'PL', name: 'Pháp lý (Thỏa thuận)', detail: 'Tư vấn thỏa thuận miệng' },
  ]},
  { group: 'DỊCH VỤ KẾ TOÁN - THUẾ', items: [
    { code: 'HDKE', name: 'Hợp đồng kế toán', detail: 'Dịch vụ kế toán trọn gói' },
    { code: 'KE', name: 'Kế toán (Thỏa thuận)', detail: 'Thỏa thuận kế toán' },
    { code: 'HDKT', name: 'Hợp đồng kiểm tra', detail: 'Kiểm tra hồ sơ thuế' },
    { code: 'KT', name: 'Kiểm tra (Thỏa thuận)', detail: 'Thỏa thuận kiểm tra' },
  ]}
];

const CONTENT_SUGGESTIONS = [
  'Dịch vụ tư vấn và thực hiện thủ tục thay đổi đăng ký doanh nghiệp',
  'Dịch vụ thay đổi nội dung đăng ký doanh nghiệp',
  'Dịch vụ hỗ trợ soạn hồ sơ thay đổi đăng ký doanh nghiệp',
  'Dịch vụ tư vấn pháp lý thường xuyên cho doanh nghiệp',
  'Dịch vụ tư vấn tuân thủ pháp luật doanh nghiệp',
  'Dịch vụ tư vấn lao động, tiền lương',
  'Dịch vụ hỗ trợ hồ sơ BHXH, BHYT, BHTN',
  'Dịch vụ hỗ trợ nhân sự hành chính'
];

interface FinanceModuleProps {
  contracts: ContractRecord[];
  setContracts: React.Dispatch<React.SetStateAction<ContractRecord[]>>;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  onPersist: (action: string, module: string, overrides?: any) => void;
  isHydrated: boolean;
}

export default function FinanceModule({ 
  contracts, 
  setContracts, 
  notifications,
  setNotifications,
  onPersist, 
  isHydrated 
}: FinanceModuleProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter states
  const [filterReferral, setFilterReferral] = useState('');
  const [filterNature, setFilterNature] = useState('');
  const [showFilters, setShowFilters] = useState({ referral: false, nature: false });

  const showToast = (message: string, type: 'success' | 'error' = 'success', user?: string) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
    
    // Dispatch custom event for real-time notifications in layout
    window.dispatchEvent(new CustomEvent('erp-notification', { 
      detail: { 
        id: Date.now().toString(),
        message, 
        timestamp: new Date().toLocaleTimeString(),
        type,
        user: user || selectedContract?.managedBy || newContract?.managedBy || 'Admin'
      } 
    }));
  };

  const [newContract, setNewContract] = useState<Partial<ContractRecord>>({
    year: '2026',
    fee: 0,
    vat: 0,
    vatRate: 8,
    unit: 'Lần',
    applyVat: true,
    managedBy: 'Admin',
    isOfficial: true,
    isContractMade: false,
    serviceType: 'HDPL',
    nature: '1 lần'
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      let d: Date;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          d = new Date(dateStr);
        } else {
          // Assuming DD/MM/YYYY if not standard ISO
          d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        d = new Date(dateStr);
      }

      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const calculateVATAndTotal = (fee: number, applyVAT: boolean, vatRate: number) => {
    if (!applyVAT || vatRate === -1) return { vat: 0, total: fee };
    const vat = Math.round(fee * (vatRate / 100));
    return { vat, total: fee + vat };
  };

  const getNextInvoiceNo = (year: string, contracts: ContractRecord[]) => {
    const yearContracts = contracts.filter(c => c.year === year && c.invoiceNo);
    // Find the highest number formatted as string
    const maxNo = yearContracts.reduce((max, c) => {
      const num = parseInt(c.invoiceNo) || 0;
      return Math.max(max, num);
    }, 0);
    return (maxNo + 1).toString().padStart(3, '0');
  };

  const getGroupKey = (year: string, dv: string, fileReceivedDate: string) => {
    if (!year || !dv || !fileReceivedDate) return '';
    const date = new Date(fileReceivedDate);
    const docYear = isNaN(date.getTime()) ? '' : date.getFullYear().toString();
    return `${year}${dv}${docYear}`;
  };

  const generateContractCode = (groupKey: string, abbreviation: string, fileReceivedDate: string, dv: string, contracts: ContractRecord[], invoiceNo?: string, forcedYear?: string) => {
    if (!dv || !dv.startsWith('HD') || !groupKey || !abbreviation || !fileReceivedDate) return '';
    
    const date = new Date(fileReceivedDate);
    const docYear = forcedYear ? forcedYear.toString() : (isNaN(date.getTime()) ? '' : date.getFullYear().toString());
    
    // Use invoiceNo if provided, otherwise count occurrences of groupKey
    let sequence = invoiceNo || '';
    if (!sequence) {
      const sameGroup = contracts.filter(c => c.groupKey === groupKey);
      sequence = (sameGroup.length + 1).toString().padStart(3, '0');
    } else {
      sequence = sequence.padStart(3, '0');
    }
    
    return `${sequence}-${docYear}${dv}/VRT-${abbreviation}`;
  };

  const getNextSTT = (dv: string, contracts: ContractRecord[]) => {
    if (!dv || !dv.startsWith('HD')) return '';
    const officialContracts = (contracts || []).filter(c => c.serviceType && c.serviceType.startsWith('HD') && c.stt);
    const maxSTT = officialContracts.reduce((max, c) => Math.max(max, parseInt(c.stt) || 0), 0);
    return (maxSTT + 1).toString();
  };

  // Auto-recalculate for newContract
  React.useEffect(() => {
    if (isAddingContract) {
      const fee = Number(newContract.fee) || 0;
      const { vat, total } = calculateVATAndTotal(fee, !!newContract.applyVat, newContract.vatRate ?? 8);
      
      const currentYear = newContract.year || '2026';
      
      // Auto-jump Invoice No if empty
      let invoiceNo = newContract.invoiceNo || '';
      if (!invoiceNo) {
        invoiceNo = getNextInvoiceNo(currentYear, contracts);
      }

      const groupKey = getGroupKey(currentYear, newContract.serviceType || '', newContract.fileReceivedDate || '');
      const contractCode = generateContractCode(
        groupKey, 
        newContract.abbreviation || '', 
        newContract.fileReceivedDate || '', 
        newContract.serviceType || '', 
        contracts,
        invoiceNo,
        currentYear
      );
      const isOfficial = (newContract.serviceType || '').startsWith('HD');

      if (
        vat !== newContract.vat || 
        total !== newContract.total || 
        groupKey !== newContract.groupKey || 
        contractCode !== newContract.contractCode || 
        isOfficial !== newContract.isOfficial ||
        invoiceNo !== newContract.invoiceNo
      ) {
        setNewContract(prev => ({
          ...prev,
          vat,
          total,
          groupKey,
          invoiceNo,
          contractCode: isOfficial ? (contractCode || prev.contractCode) : '',
          isOfficial
        }));
      }
    }
  }, [
    newContract.fee, 
    newContract.applyVat, 
    newContract.vatRate, 
    newContract.year, 
    newContract.invoiceNo,
    newContract.serviceType, 
    newContract.fileReceivedDate, 
    newContract.abbreviation,
    isAddingContract,
    contracts
  ]);

  // Auto-recalculate for selectedContract
  React.useEffect(() => {
    if (selectedContract) {
      // Recalculate VAT and Total
      const fee = Number(selectedContract.fee) || 0;
      const { vat, total } = calculateVATAndTotal(fee, !!selectedContract.applyVat, selectedContract.vatRate ?? 8);
      
      const groupKey = getGroupKey(selectedContract.year, selectedContract.serviceType, selectedContract.fileReceivedDate);
      const isOfficial = (selectedContract.serviceType || '').startsWith('HD');

      // Re-generate contract code if relevant fields changed
      const contractCode = generateContractCode(
        groupKey, 
        selectedContract.abbreviation || '', 
        selectedContract.fileReceivedDate || '', 
        selectedContract.serviceType, 
        contracts.filter(c => c.id !== selectedContract.id),
        selectedContract.invoiceNo,
        selectedContract.year
      );

      if (
        vat !== selectedContract.vat || 
        total !== selectedContract.total || 
        groupKey !== selectedContract.groupKey || 
        isOfficial !== selectedContract.isOfficial ||
        contractCode !== selectedContract.contractCode
      ) {
        setSelectedContract(prev => prev ? {
          ...prev,
          vat,
          total,
          groupKey,
          isOfficial,
          contractCode: isOfficial ? (contractCode || prev.contractCode) : ''
        } : null);
      }
    }
  }, [
    selectedContract?.fee, 
    selectedContract?.applyVat, 
    selectedContract?.vatRate, 
    selectedContract?.year, 
    selectedContract?.invoiceNo,
    selectedContract?.serviceType, 
    selectedContract?.fileReceivedDate,
    selectedContract?.abbreviation
  ]);

  const handleAddContract = async () => {
    // 1. Validate mandatory data
    if (!newContract.clientName || !newContract.mst) {
      showToast('Tên công ty và MST là bắt buộc', 'error');
      return;
    }

    if (isSavingInProgress) return;
    setIsSavingInProgress(true);

    try {
      // 2. Build full record with final calculations
      const fee = Number(newContract.fee) || 0;
      const { vat, total } = calculateVATAndTotal(fee, !!newContract.applyVat, newContract.vatRate ?? 8);
      const currentYear = newContract.year || '2026';
      
      const invoiceNo = newContract.invoiceNo || getNextInvoiceNo(currentYear, contracts);
      const groupKey = getGroupKey(currentYear, newContract.serviceType || '', newContract.fileReceivedDate || '');
      const isOfficial = (newContract.serviceType || '').startsWith('HD');
      const contractCode = generateContractCode(
        groupKey, 
        newContract.abbreviation || '', 
        newContract.fileReceivedDate || '', 
        newContract.serviceType || '', 
        contracts,
        invoiceNo,
        currentYear
      );
      
      const stt = getNextSTT(newContract.serviceType || '', contracts);

      // 3. Create record object
      const contract: ContractRecord = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        stt,
        groupKey,
        year: currentYear,
        invoiceNo,
        invoiceDate: newContract.invoiceDate || '',
        contractDate: newContract.contractDate || '',
        contractCode: isOfficial ? (contractCode || newContract.contractCode || '') : '',
        serviceType: newContract.serviceType || 'HDPL',
        serviceDetail: newContract.serviceDetail || '',
        referralName: newContract.referralName || '',
        nature: newContract.nature || '',
        clientName: newContract.clientName || '',
        abbreviation: newContract.abbreviation || '',
        mst: newContract.mst || '',
        issuedDate: newContract.issuedDate || '',
        address: newContract.address || '',
        representative: newContract.representative || '',
        position: newContract.position || '',
        phone: newContract.phone || '',
        email: newContract.email || '',
        accountNo: newContract.accountNo || '',
        bankName: newContract.bankName || '',
        content: newContract.content || '',
        note: newContract.note || '',
        appendix: newContract.appendix || '',
        fee: fee,
        unit: newContract.unit || 'Lần',
        vat: vat,
        total: total,
        vatRate: newContract.vatRate ?? 8,
        paymentDate: newContract.paymentDate || '',
        fileReceivedDate: newContract.fileReceivedDate || '',
        fileSentDate: newContract.fileSentDate || '',
        fileSignedDate: newContract.fileSignedDate || '',
        fileSubmittedDate: newContract.fileSubmittedDate || '',
        resultReceivedDate: newContract.resultReceivedDate || '',
        isCompleted: !!newContract.isCompleted,
        isOfficial: isOfficial,
        isContractMade: !!newContract.isContractMade,
        applyVat: !!newContract.applyVat,
        managedBy: newContract.managedBy || auth.currentUser?.email || 'Admin'
      };

      // 4. Map to snake_case for API
      const apiPayload = {
        stt: contract.stt,
        group_key: contract.groupKey,
        year: contract.year,
        invoice_no: contract.invoiceNo,
        invoice_date: contract.invoiceDate,
        contract_date: contract.contractDate,
        contract_code: contract.contractCode,
        service_type: contract.serviceType,
        service_detail: contract.serviceDetail,
        referral_name: contract.referralName,
        nature: contract.nature,
        client_name: contract.clientName,
        abbreviation: contract.abbreviation,
        mst: contract.mst,
        issued_date: contract.issuedDate,
        address: contract.address,
        representative: contract.representative,
        position: contract.position,
        phone: contract.phone,
        email: contract.email,
        account_no: contract.accountNo,
        bank_name: contract.bankName,
        content: contract.content,
        note: contract.note,
        appendix: contract.appendix,
        fee: contract.fee,
        unit: contract.unit,
        vat: contract.vat,
        vat_rate: contract.vatRate,
        total: contract.total,
        payment_date: contract.paymentDate,
        file_received_date: contract.fileReceivedDate,
        file_sent_date: contract.fileSentDate,
        file_signed_date: contract.fileSignedDate,
        file_submitted_date: contract.fileSubmittedDate,
        result_received_date: contract.resultReceivedDate,
        is_completed: contract.isCompleted ? 1 : 0,
        is_official: contract.isOfficial ? 1 : 0,
        is_contract_made: contract.isContractMade ? 1 : 0,
        apply_vat: contract.applyVat ? 1 : 0,
        managed_by: contract.managedBy
      };

      // 5. Call API
      const response = await ErpApiService.apiPost('/contracts', apiPayload);

      if (response.ok) {
        // Use the ID returned from server if available
        if (response.id) contract.id = response.id;
        
        // 6. Update local state ONLY on success
        const updatedContracts = [contract, ...contracts];
        setContracts(updatedContracts);
        
        // Update logs locally and on server
        const logEntry = {
          id: Date.now().toString(),
          message: `Đã tạo ${isOfficial ? 'Hợp đồng' : 'Thỏa thuận'} mới: ${contract.clientName}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          user: contract.managedBy,
          module: 'Finance'
        };
        setNotifications([logEntry, ...notifications].slice(0, 5000));
        
        onPersist('CREATE_CONTRACT', 'Finance', { contracts: updatedContracts }); // Keep for legacy if needed

        showToast(`Đã lưu ${isOfficial ? 'Hợp đồng' : 'Thỏa thuận'} thành công!`, 'success', contract.managedBy);
        setNewContract({
          year: '2026',
          fee: 0,
          vat: 0,
          vatRate: 8,
          unit: 'Lần',
          applyVat: true,
          managedBy: 'Admin',
          serviceType: 'HDPL',
          nature: '1 lần'
        });
        setIsAddingContract(false);
      } else {
        throw new Error(response.error || 'API_FAILED');
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      showToast('Lỗi khi lưu hợp đồng vào database: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setIsSavingInProgress(false);
    }
  };

  const handleUpdateContract = async () => {
    if (!selectedContract || isSavingInProgress) return;
    setIsSavingInProgress(true);

    try {
      // 1. Recalculate fields for update
      const fee = Number(selectedContract.fee) || 0;
      const { vat, total } = calculateVATAndTotal(fee, !!selectedContract.applyVat, selectedContract.vatRate ?? 8);
      const groupKey = getGroupKey(selectedContract.year, selectedContract.serviceType, selectedContract.fileReceivedDate);
      const isOfficial = (selectedContract.serviceType || '').startsWith('HD');
      const contractCode = generateContractCode(
        groupKey, 
        selectedContract.abbreviation || '', 
        selectedContract.fileReceivedDate || '', 
        selectedContract.serviceType, 
        contracts.filter(c => c.id !== selectedContract.id), 
        selectedContract.invoiceNo, 
        selectedContract.year
      );
      
      const updatedContract = {
        ...selectedContract,
        vat,
        total,
        groupKey,
        isOfficial,
        contractCode: isOfficial ? (contractCode || selectedContract.contractCode) : ''
      };

      // 2. Map to snake_case for API
      const apiPayload = {
        stt: updatedContract.stt,
        group_key: updatedContract.groupKey,
        year: updatedContract.year,
        invoice_no: updatedContract.invoiceNo,
        invoice_date: updatedContract.invoiceDate,
        contract_date: updatedContract.contractDate,
        contract_code: updatedContract.contractCode,
        service_type: updatedContract.serviceType,
        service_detail: updatedContract.serviceDetail,
        referral_name: updatedContract.referralName,
        nature: updatedContract.nature,
        client_name: updatedContract.clientName,
        abbreviation: updatedContract.abbreviation,
        mst: updatedContract.mst,
        issued_date: updatedContract.issuedDate,
        address: updatedContract.address,
        representative: updatedContract.representative,
        position: updatedContract.position,
        phone: updatedContract.phone,
        email: updatedContract.email,
        account_no: updatedContract.accountNo,
        bank_name: updatedContract.bankName,
        content: updatedContract.content,
        note: updatedContract.note,
        appendix: updatedContract.appendix,
        fee: updatedContract.fee,
        unit: updatedContract.unit,
        vat: updatedContract.vat,
        vat_rate: updatedContract.vatRate,
        total: updatedContract.total,
        payment_date: updatedContract.paymentDate,
        file_received_date: updatedContract.fileReceivedDate,
        file_sent_date: updatedContract.fileSentDate,
        file_signed_date: updatedContract.fileSignedDate,
        file_submitted_date: updatedContract.fileSubmittedDate,
        result_received_date: updatedContract.resultReceivedDate,
        is_completed: updatedContract.isCompleted ? 1 : 0,
        is_official: updatedContract.isOfficial ? 1 : 0,
        is_contract_made: updatedContract.isContractMade ? 1 : 0,
        apply_vat: updatedContract.applyVat ? 1 : 0,
        managed_by: updatedContract.managedBy
      };

      // 3. Call API
      const response = await ErpApiService.apiPut(`/contracts/${updatedContract.id}`, apiPayload);

      if (response.ok) {
        // 4. Update local state ONLY on success
        const updatedContracts = contracts.map(c => c.id === updatedContract.id ? updatedContract : c);
        setContracts(updatedContracts);
        
        const logEntry = {
          id: Date.now().toString(),
          message: `Đã cập nhật ${isOfficial ? 'Hợp đồng' : 'Thỏa thuận'}: ${updatedContract.clientName}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          user: updatedContract.managedBy,
          module: 'Finance'
        };
        setNotifications([logEntry, ...notifications].slice(0, 5000));
        
        onPersist('UPDATE_CONTRACT', 'Finance', { contracts: updatedContracts });

        showToast(`Cập nhật thành công: ${updatedContract.clientName}`, 'success', updatedContract.managedBy);
        setSelectedContract(null);
      } else {
        throw new Error(response.error || 'API_FAILED');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      showToast('Lỗi khi cập nhật dữ liệu vào database.', 'error');
    } finally {
      setIsSavingInProgress(false);
    }
  };

  const exportToExcel = () => {
    const data = contracts.map((c, i) => ({
      'STT': c.stt || (i + 1),
      'Mã nhóm': c.groupKey,
      'Năm HĐ': c.year,
      'Số hóa đơn': c.invoiceNo,
      'Ngày hóa đơn': formatDate(c.invoiceDate),
      'Ngày hợp đồng': formatDate(c.contractDate),
      'SỐ HĐ-XUẤT HÓA ĐƠN': c.contractCode,
      'DV': c.serviceType,
      'Chi tiết DV': c.serviceDetail,
      'Người giới thiệu': c.referralName,
      'Tính chất giới thiệu': c.nature,
      'Tên công ty': c.clientName,
      'Viết tắt': c.abbreviation,
      'MST': c.mst,
      'Ngày cấp': formatDate(c.issuedDate),
      'Địa chỉ': c.address,
      'Người đại diện': c.representative,
      'Chức vụ': c.position,
      'Điện thoại': `'${c.phone}`,
      'Email': c.email,
      'Số tài khoản': `'${c.accountNo}`,
      'Ngân hàng': c.bankName,
      'Nội dung': c.content,
      'Ghi chú': c.note,
      'Phụ lục': c.appendix,
      'Phí': c.fee,
      'DVT': c.unit,
      'VAT': c.vat,
      'Tổng cộng': c.total,
      'Ngày thu tiền': formatDate(c.paymentDate),
      'Ngày nhận hồ sơ': formatDate(c.fileReceivedDate),
      'Ngày gửi hồ sơ': formatDate(c.fileSentDate),
      'Ngày ký hồ sơ': formatDate(c.fileSignedDate),
      'Ngày nộp hồ sơ': formatDate(c.fileSubmittedDate),
      'Ngày nhận kết quả': formatDate(c.resultReceivedDate),
      'Hoàn thành': c.isCompleted ? 'OK' : '',
      'Đã làm HĐ': c.isContractMade ? 'YES' : 'NO'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TT hợp đồng');
    XLSX.writeFile(wb, `TT_Hop_dong_Veratax_${new Date().getFullYear()}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', cellStyles: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      // Attempt to read data starting from row 4 (SheetJS uses 0-based indexing)
      const data = XLSX.utils.sheet_to_json(ws, { range: 3 }) as any[];

      const newContracts: ContractRecord[] = data.map((row, index) => {
        const dv = String(row['DV'] || '');
        const fee = Number(row['Phí']) || 0;
        const vat = Number(row['VAT']) || 0;
        const isOfficial = dv.startsWith('HD');
        
        return {
          id: `import-${Date.now()}-${index}`,
          stt: String(row['STT'] || ''),
          groupKey: String(row['Mã nhóm'] || ''),
          year: String(row['Năm HĐ'] || '2026'),
          invoiceNo: String(row['Số hóa đơn'] || ''),
          invoiceDate: String(row['Ngày hóa đơn'] || ''),
          contractDate: String(row['Ngày hợp đồng'] || ''),
          contractCode: String(row['SỐ HĐ-XUẤT HÓA ĐƠN'] || ''),
          serviceType: dv,
          serviceDetail: String(row['Chi tiết DV'] || ''),
          referralName: String(row['Người giới thiệu'] || ''),
          nature: String(row['Tính chất giới thiệu'] || ''),
          clientName: String(row['Tên công ty'] || ''),
          abbreviation: String(row['Viết tắt'] || ''),
          mst: String(row['MST'] || ''),
          issuedDate: String(row['Ngày cấp'] || ''),
          address: String(row['Địa chỉ'] || ''),
          representative: String(row['Người đại diện'] || ''),
          position: String(row['Chức vụ'] || ''),
          phone: String(row['Điện thoại'] || '').replace(/'/g, ''),
          email: String(row['Email'] || ''),
          accountNo: String(row['Số tài khoản'] || '').replace(/'/g, ''),
          bankName: String(row['Ngân hàng'] || ''),
          content: String(row['Nội dung'] || ''),
          note: String(row['Ghi chú'] || ''),
          appendix: String(row['Phụ lục'] || ''),
          fee: fee,
          unit: String(row['DVT'] || 'Lần'),
          vat: vat,
          vatRate: vat > 0 ? (vat >= fee * 0.09 ? 10 : vat >= fee * 0.07 ? 8 : 5) : 0, // Guestimate vatRate
          total: Number(row['Tổng cộng']) || (fee + vat),
          paymentDate: String(row['Ngày thu tiền'] || ''),
          fileReceivedDate: String(row['Ngày nhận hồ sơ'] || ''),
          fileSentDate: String(row['Ngày gửi hồ sơ'] || ''),
          fileSignedDate: String(row['Ngày ký hồ sơ'] || ''),
          fileSubmittedDate: String(row['Ngày nộp hồ sơ'] || ''),
          resultReceivedDate: String(row['Ngày nhận kết quả'] || ''),
          isCompleted: row['Hoàn thành'] === 'OK',
          isOfficial: isOfficial,
          isContractMade: row['Đã làm HĐ'] === 'YES', // Simplified color detection fallback
          applyVat: vat > 0,
          managedBy: 'Imported'
        };
      });

      const updatedContracts = [...contracts, ...newContracts];
      if (newContracts.length > 0) {
        setContracts(updatedContracts);
        onPersist('IMPORT_EXCEL', 'Finance', { contracts: updatedContracts });
      } else {
        showToast('Không tìm thấy dữ liệu hợp lệ trong file Excel', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredContracts = contracts.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = (
      c.clientName.toLowerCase().includes(searchLower) ||
      c.mst.includes(searchTerm) ||
      c.abbreviation.toLowerCase().includes(searchLower) ||
      (c.contractCode && c.contractCode.toLowerCase().includes(searchLower)) ||
      (c.content && c.content.toLowerCase().includes(searchLower))
    );

    const matchReferral = !filterReferral || (c.referralName || '').toLowerCase().includes(filterReferral.toLowerCase());
    const matchNature = !filterNature || (c.nature || '').toLowerCase().includes(filterNature.toLowerCase());

    return matchSearch && matchReferral && matchNature;
  });

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Xác nhận xóa!</h3>
              <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed uppercase tracking-tight">
                ⚠️ HỢP ĐỒNG SẼ BỊ XÓA VĨNH VIỄN!<br/>
                Bạn có chắc chắn muốn xóa dữ liệu này?
              </p>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setDeletingId(null)}
                      className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      onClick={async () => { 
                        const contract = contracts.find(c => c.id === deletingId);
                        if (!contract) return;

                        try {
                          const response = await ErpApiService.apiDelete(`/contracts/${deletingId}`);
                          if (response.ok) {
                            const label = contract.isOfficial ? 'Hợp đồng' : 'Thỏa thuận';
                            const code = contract.contractCode || contract.clientName || label;
                            const updatedContracts = contracts.filter(c => c.id !== deletingId);
                            
                            setContracts(updatedContracts); 
                            onPersist('DELETE_CONTRACT', 'Finance', { contracts: updatedContracts });
                            showToast(`Đã xóa ${label}: ${code} thành công!`, 'success');
                          } else {
                            throw new Error(response.error || 'DELETE_FAILED');
                          }
                        } catch (e) {
                          console.error('Delete contract failed', e);
                          showToast('Lỗi khi xóa hợp đồng khỏi database', 'error');
                        } finally {
                          setDeletingId(null);
                          setSelectedContract(null);
                        }
                      }}
                      className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all font-bold"
                    >
                      Đồng ý xóa
                    </button>
                  </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contract Detail/Edit Modal */}
      <AnimatePresence>
        {(isAddingContract || selectedContract) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white w-full max-w-6xl h-[85vh] rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {isAddingContract ? 'Thêm hợp đồng mới' : 'Chi tiết hợp đồng'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                    {isAddingContract ? 'Nhập thông tin theo mẫu Excel' : `Mã HĐ: ${selectedContract?.contractCode || 'N/A'}`}
                  </p>
                </div>
                <button 
                  onClick={() => { setIsAddingContract(false); setSelectedContract(null); }} 
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 group"
                >
                  <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {/* Block 1: Thông tin chung */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest text-emerald-600">Khối 1: Thông tin chung</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="Năm" value={isAddingContract ? newContract.year : selectedContract?.year} onChange={v => isAddingContract ? setNewContract({...newContract, year: v}) : setSelectedContract({...selectedContract!, year: v})} />
                    <InputField label="Số hóa đơn" value={isAddingContract ? newContract.invoiceNo : selectedContract?.invoiceNo} onChange={v => isAddingContract ? setNewContract({...newContract, invoiceNo: v}) : setSelectedContract({...selectedContract!, invoiceNo: v})} />
                    <InputField label="Ngày hóa đơn" type="date" value={isAddingContract ? newContract.invoiceDate : selectedContract?.invoiceDate} onChange={v => isAddingContract ? setNewContract({...newContract, invoiceDate: v}) : setSelectedContract({...selectedContract!, invoiceDate: v})} />
                    <InputField label="Ngày hợp đồng" type="date" value={isAddingContract ? newContract.contractDate : selectedContract?.contractDate} onChange={v => isAddingContract ? setNewContract({...newContract, contractDate: v}) : setSelectedContract({...selectedContract!, contractDate: v})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                      <AnimatePresence mode="wait">
                        {(isAddingContract ? (newContract.serviceType || '').startsWith('HD') : (selectedContract?.serviceType || '').startsWith('HD')) ? (
                          <motion.div
                            key="contract-code-visible"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <InputField label="Số HĐ - Xuất hóa đơn" value={isAddingContract ? newContract.contractCode : selectedContract?.contractCode} disabled />
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="contract-code-hidden"
                            className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mt-6"
                          >
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">⚠️ Dịch vụ thỏa thuận - Không cấp số hợp đồng</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <CustomSelect 
                      label="Dịch vụ (DV)"
                      value={isAddingContract ? newContract.serviceType || '' : selectedContract?.serviceType || ''}
                      groups={SERVICE_CATALOG}
                      onChange={v => isAddingContract ? setNewContract({...newContract, serviceType: v}) : setSelectedContract({...selectedContract!, serviceType: v})}
                    />
                    <InputField label="Chi tiết DV" value={isAddingContract ? newContract.serviceDetail : selectedContract?.serviceDetail} onChange={v => isAddingContract ? setNewContract({...newContract, serviceDetail: v}) : setSelectedContract({...selectedContract!, serviceDetail: v})} />
                  </div>
                </div>

                {/* Block 2: Thông tin khách hàng */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Search className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest text-indigo-600">Khối 2: Thông tin khách hàng</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Tên công ty" className="md:col-span-2" value={isAddingContract ? newContract.clientName : selectedContract?.clientName} onChange={v => isAddingContract ? setNewContract({...newContract, clientName: v}) : setSelectedContract({...selectedContract!, clientName: v})} />
                    <InputField label="Viết tắt" value={isAddingContract ? newContract.abbreviation : selectedContract?.abbreviation} onChange={v => isAddingContract ? setNewContract({...newContract, abbreviation: v}) : setSelectedContract({...selectedContract!, abbreviation: v})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="MST" value={isAddingContract ? newContract.mst : selectedContract?.mst} onChange={v => isAddingContract ? setNewContract({...newContract, mst: v}) : setSelectedContract({...selectedContract!, mst: v})} />
                    <InputField label="Ngày cấp" type="date" value={isAddingContract ? newContract.issuedDate : selectedContract?.issuedDate} onChange={v => isAddingContract ? setNewContract({...newContract, issuedDate: v}) : setSelectedContract({...selectedContract!, issuedDate: v})} />
                    <InputField label="Người đại diện" value={isAddingContract ? newContract.representative : selectedContract?.representative} onChange={v => isAddingContract ? setNewContract({...newContract, representative: v}) : setSelectedContract({...selectedContract!, representative: v})} />
                    <InputField label="Chức vụ" value={isAddingContract ? newContract.position : selectedContract?.position} onChange={v => isAddingContract ? setNewContract({...newContract, position: v}) : setSelectedContract({...selectedContract!, position: v})} />
                  </div>
                  <InputField label="Địa chỉ" value={isAddingContract ? newContract.address : selectedContract?.address} onChange={v => isAddingContract ? setNewContract({...newContract, address: v}) : setSelectedContract({...selectedContract!, address: v})} />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="Điện thoại" value={isAddingContract ? newContract.phone : selectedContract?.phone} onChange={v => isAddingContract ? setNewContract({...newContract, phone: v}) : setSelectedContract({...selectedContract!, phone: v})} />
                    <InputField label="Email" value={isAddingContract ? newContract.email : selectedContract?.email} onChange={v => isAddingContract ? setNewContract({...newContract, email: v}) : setSelectedContract({...selectedContract!, email: v})} />
                    <InputField label="Số tài khoản" value={isAddingContract ? newContract.accountNo : selectedContract?.accountNo} onChange={v => isAddingContract ? setNewContract({...newContract, accountNo: v}) : setSelectedContract({...selectedContract!, accountNo: v})} />
                    <InputField label="Ngân hàng" value={isAddingContract ? newContract.bankName : selectedContract?.bankName} onChange={v => isAddingContract ? setNewContract({...newContract, bankName: v}) : setSelectedContract({...selectedContract!, bankName: v})} />
                  </div>
                </div>

                {/* Block 3: Người giới thiệu */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest text-rose-600">Khối 3: Thông tin người giới thiệu</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3 block">Có người giới thiệu?</label>
                       <div className="flex items-center space-x-3 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                         <button 
                           onClick={() => isAddingContract 
                            ? setNewContract({...newContract, referralName: newContract.referralName || 'Chưa nhập', nature: newContract.nature || 'Theo dõi'}) 
                            : setSelectedContract({...selectedContract!, referralName: selectedContract?.referralName || 'Chưa nhập', nature: selectedContract?.nature || 'Theo dõi'})}
                           className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ (isAddingContract ? newContract.referralName : selectedContract?.referralName) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-600' }`}
                         >
                           Có 
                         </button>
                         <button 
                           onClick={() => isAddingContract 
                            ? setNewContract({...newContract, referralName: '', nature: ''}) 
                            : setSelectedContract({...selectedContract!, referralName: '', nature: ''})}
                           className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ !(isAddingContract ? newContract.referralName : selectedContract?.referralName) ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:text-slate-600' }`}
                         >
                           Không
                         </button>
                       </div>
                    </div>
                    <InputField 
                      label="Người giới thiệu" 
                      value={isAddingContract ? newContract.referralName : selectedContract?.referralName} 
                      onChange={v => isAddingContract ? setNewContract({...newContract, referralName: v}) : setSelectedContract({...selectedContract!, referralName: v})} 
                      disabled={!(isAddingContract ? newContract.referralName : selectedContract?.referralName)}
                    />
                    <CustomSelect 
                      label="Tính chất" 
                      value={isAddingContract ? newContract.nature : selectedContract?.nature} 
                      options={[{ label: '1 lần', value: '1 lần' }, { label: 'Theo dõi', value: 'Theo dõi' }]}
                      onChange={v => isAddingContract ? setNewContract({...newContract, nature: v}) : setSelectedContract({...selectedContract!, nature: v})} 
                      disabled={!(isAddingContract ? newContract.referralName : selectedContract?.referralName)}
                    />
                  </div>
                </div>

                {/* Block 4: Nội dung & Tài chính */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest text-amber-600">Khối 4: Nội dung dịch vụ & Tài chính</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      label="Nội dung" 
                      value={isAddingContract ? newContract.content : selectedContract?.content} 
                      onChange={v => isAddingContract ? setNewContract({...newContract, content: v}) : setSelectedContract({...selectedContract!, content: v})} 
                    />
                    <InputField label="Phụ lục" value={isAddingContract ? newContract.appendix : selectedContract?.appendix} onChange={v => isAddingContract ? setNewContract({...newContract, appendix: v}) : setSelectedContract({...selectedContract!, appendix: v})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="Phí (Trước VAT)" type="number" value={isAddingContract ? newContract.fee : selectedContract?.fee} onChange={v => isAddingContract ? setNewContract({...newContract, fee: Number(v)}) : setSelectedContract({...selectedContract!, fee: Number(v)})} />
                    <InputField label="DVT" value={isAddingContract ? newContract.unit : selectedContract?.unit} onChange={v => isAddingContract ? setNewContract({...newContract, unit: v}) : setSelectedContract({...selectedContract!, unit: v})} />
                    <CustomSelect 
                      label="Mức thuế VAT"
                      value={isAddingContract ? newContract.vatRate : selectedContract?.vatRate}
                      options={VAT_OPTIONS}
                      onChange={v => isAddingContract ? setNewContract({...newContract, vatRate: v}) : setSelectedContract({...selectedContract!, vatRate: v})}
                    />
                    <InputField label="Tổng cộng" type="number" disabled value={isAddingContract ? newContract.total : selectedContract?.total} />
                  </div>
                  <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${ (isAddingContract ? newContract.applyVat : selectedContract?.applyVat) ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400' }`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Áp dụng VAT:</span>
                    </div>
                    <button 
                      onClick={() => isAddingContract ? setNewContract({...newContract, applyVat: !newContract.applyVat}) : setSelectedContract({...selectedContract!, applyVat: !selectedContract?.applyVat})}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ (isAddingContract ? newContract.applyVat : selectedContract?.applyVat) ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-white border border-slate-200 text-slate-400 shadow-sm' }`}
                    >
                      {(isAddingContract ? newContract.applyVat : selectedContract?.applyVat) ? 'ĐANG ÁP DỤNG' : 'KHÔNG ÁP DỤNG'}
                    </button>
                  </div>
                </div>

                {/* Block 5: Theo dõi hồ sơ */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest text-indigo-600">Khối 5: Theo dõi tiến độ hồ sơ</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="Ngày thu tiền" type="date" value={isAddingContract ? newContract.paymentDate : selectedContract?.paymentDate} onChange={v => isAddingContract ? setNewContract({...newContract, paymentDate: v}) : setSelectedContract({...selectedContract!, paymentDate: v})} />
                    <InputField label="Ngày nhận HS" type="date" value={isAddingContract ? newContract.fileReceivedDate : selectedContract?.fileReceivedDate} onChange={v => isAddingContract ? setNewContract({...newContract, fileReceivedDate: v}) : setSelectedContract({...selectedContract!, fileReceivedDate: v})} />
                    <InputField label="Ngày gửi HS" type="date" value={isAddingContract ? newContract.fileSentDate : selectedContract?.fileSentDate} onChange={v => isAddingContract ? setNewContract({...newContract, fileSentDate: v}) : setSelectedContract({...selectedContract!, fileSentDate: v})} />
                    <InputField label="Ngày ký HS" type="date" value={isAddingContract ? newContract.fileSignedDate : selectedContract?.fileSignedDate} onChange={v => isAddingContract ? setNewContract({...newContract, fileSignedDate: v}) : setSelectedContract({...selectedContract!, fileSignedDate: v})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Ngày nộp HS" type="date" value={isAddingContract ? newContract.fileSubmittedDate : selectedContract?.fileSubmittedDate} onChange={v => isAddingContract ? setNewContract({...newContract, fileSubmittedDate: v}) : setSelectedContract({...selectedContract!, fileSubmittedDate: v})} />
                    <InputField label="Ngày nhận kết quả" type="date" value={isAddingContract ? newContract.resultReceivedDate : selectedContract?.resultReceivedDate} onChange={v => isAddingContract ? setNewContract({...newContract, resultReceivedDate: v}) : setSelectedContract({...selectedContract!, resultReceivedDate: v})} />
                    <InputField label="Ghi chú hồ sơ" value={isAddingContract ? newContract.note : selectedContract?.note} onChange={v => isAddingContract ? setNewContract({...newContract, note: v}) : setSelectedContract({...selectedContract!, note: v})} />
                  </div>
                  <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${ (isAddingContract ? newContract.isCompleted : selectedContract?.isCompleted) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400' }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái hoàn thành:</span>
                    </div>
                    <button 
                      onClick={() => isAddingContract ? setNewContract({...newContract, isCompleted: !newContract.isCompleted}) : setSelectedContract({...selectedContract!, isCompleted: !selectedContract?.isCompleted})}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ (isAddingContract ? newContract.isCompleted : selectedContract?.isCompleted) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-slate-200 text-slate-400 shadow-sm' }`}
                    >
                      {(isAddingContract ? newContract.isCompleted : selectedContract?.isCompleted) ? 'OK' : 'CHƯA XONG'}
                    </button>
                  </div>
                </div>

                {/* Block 6: Trạng thái hệ thống */}
                <div className="space-y-6">
                   <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest text-slate-600">Khối 6: Trạng thái hệ thống</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${ (isAddingContract ? newContract.isContractMade : selectedContract?.isContractMade) ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400' }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã làm hợp đồng:</span>
                      </div>
                      <button 
                        onClick={() => isAddingContract ? setNewContract({...newContract, isContractMade: !newContract.isContractMade}) : setSelectedContract({...selectedContract!, isContractMade: !selectedContract?.isContractMade})}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ (isAddingContract ? newContract.isContractMade : selectedContract?.isContractMade) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white border border-slate-200 text-slate-400 shadow-sm' }`}
                      >
                        {(isAddingContract ? newContract.isContractMade : selectedContract?.isContractMade) ? 'ĐÃ LÀM' : 'CHƯA LÀM'}
                      </button>
                    </div>
                    <InputField label="Nhân sự quản lý" value={isAddingContract ? newContract.managedBy : selectedContract?.managedBy} onChange={v => isAddingContract ? setNewContract({...newContract, managedBy: v}) : setSelectedContract({...selectedContract!, managedBy: v})} />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                 {!isAddingContract && (
                   <button 
                     onClick={() => setDeletingId(selectedContract!.id)}
                     className="px-6 py-4 text-xs font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
                   >
                     Xóa hợp đồng này
                   </button>
                 )}
                 <div className="flex items-center space-x-4 ml-auto">
                    <button 
                      onClick={() => { setIsAddingContract(false); setSelectedContract(null); }}
                      className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      onClick={isAddingContract ? handleAddContract : handleUpdateContract}
                      disabled={isSavingInProgress}
                      className={`px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[20px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all ${isSavingInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSavingInProgress ? 'Đang lưu...' : (isAddingContract ? 'Lưu hợp đồng mới' : 'Cập nhật thông tin')}
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-10 right-10 z-[500] px-8 py-5 rounded-[24px] shadow-2xl flex items-center space-x-4 border ${toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-900' : 'bg-white border-rose-100 text-rose-900'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Hệ thống Veratax</p>
              <p className="text-sm font-bold tracking-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[40px] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 w-full xl:w-auto">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-3 tracking-tight">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <span>Hợp đồng Veratax</span>
              </h2>
            </div>
            <div className="relative w-full md:w-[400px] group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Tìm MST, tên công ty, NV quản lý..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-500 focus:shadow-xl focus:shadow-emerald-500/5 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
            <button 
              onClick={() => setIsAddingContract(true)}
              className="flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm dòng mới</span>
            </button>
            <label className="flex items-center space-x-3 px-8 py-4 bg-white border border-slate-100 text-slate-900 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-900/5 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Import Excel</span>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
            </label>
            <button 
              onClick={exportToExcel}
              className="flex items-center space-x-3 px-8 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-100 transition-all active:scale-95 shadow-lg shadow-emerald-500/5"
            >
              <Download className="w-4 h-4" />
              <span>Xuất report</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-100 font-black">
                <th className="px-4 py-4 text-[9px] text-slate-400 uppercase tracking-widest w-[60px] text-center border-r border-slate-100">STT</th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest w-[120px] border-r border-slate-100">Năm / MST</th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest border-r border-slate-100">Tên công ty / Hợp đồng</th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest border-r border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Người giới thiệu</span>
                    <button 
                      onClick={() => setShowFilters(prev => ({ ...prev, referral: !prev.referral }))}
                      className={`p-1 rounded-md transition-colors ${filterReferral ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200 text-slate-300'}`}
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>
                  {showFilters.referral && (
                    <input 
                      autoFocus
                      className="mt-2 w-full px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-medium outline-none focus:border-indigo-500"
                      placeholder="Lọc..."
                      value={filterReferral}
                      onChange={e => setFilterReferral(e.target.value)}
                    />
                  )}
                </th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest border-r border-slate-100">
                   <div className="flex items-center justify-between">
                    <span>Tính chất</span>
                    <button 
                      onClick={() => setShowFilters(prev => ({ ...prev, nature: !prev.nature }))}
                      className={`p-1 rounded-md transition-colors ${filterNature ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200 text-slate-300'}`}
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>
                  {showFilters.nature && (
                    <input 
                      autoFocus
                      className="mt-2 w-full px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-medium outline-none focus:border-indigo-500"
                      placeholder="Lọc..."
                      value={filterNature}
                      onChange={e => setFilterNature(e.target.value)}
                    />
                  )}
                </th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest text-right border-r border-slate-100">Phí dịch vụ</th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest border-r border-slate-100">Nội dung</th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest text-center border-r border-slate-100">Hồ sơ</th>
                <th className="px-6 py-4 text-[9px] text-slate-400 uppercase tracking-widest text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContracts.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedContract(c)}
                  className="hover:bg-emerald-50/10 transition-all cursor-pointer border-b border-slate-50 group"
                >
                  <td className="px-4 py-4 border-r border-slate-50 text-center">
                    <span className="text-[11px] font-black text-slate-400">{c.stt || '-'}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 w-fit px-1.5 py-0.5 rounded mb-1">{c.year}</span>
                      <span className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{c.mst}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[250px]">{c.clientName}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${c.isOfficial ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                          {c.isOfficial ? 'Hợp đồng' : 'Thỏa thuận'}
                        </span>
                        {c.contractCode && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HĐ: {c.contractCode}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-50">
                     <span className="text-[10px] font-bold text-slate-600 uppercase truncate block max-w-[120px]">{c.referralName || '-'}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-50">
                     <span className={`text-[9px] font-black uppercase tracking-widest ${c.nature === 'Theo dõi' ? 'text-indigo-500' : 'text-slate-400'}`}>{c.nature || '-'}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-50 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-slate-900">{(Number(c.total) || 0).toLocaleString()}đ</span>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.paymentDate ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          {c.paymentDate ? `Đã thu: ${formatDate(c.paymentDate)}` : 'Chưa thu tiền'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-50">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-[10px] font-bold text-slate-600 uppercase leading-tight truncate">{c.content}</span>
                      <span className="text-[9px] font-medium text-slate-400 italic truncate">{c.serviceDetail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-50 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${c.isCompleted ? 'text-emerald-500' : c.fileReceivedDate ? 'text-amber-500' : 'text-slate-300'}`}>
                        {c.isCompleted ? 'Hoàn thành' : c.fileReceivedDate ? 'Đang xử lý' : 'Chưa nhận'}
                      </span>
                      {c.fileReceivedDate && <span className="text-[8px] text-slate-400 font-mono mt-0.5">{formatDate(c.fileReceivedDate)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end space-y-1.5">
                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${c.isContractMade ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                        {c.isContractMade ? 'Đã làm HĐ' : 'Chưa làm HĐ'}
                      </div>
                      {c.isCompleted && (
                        <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-600 text-white rounded text-[8px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>OK</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({ label, value, options, groups, onChange, disabled }: { 
  label: string; 
  value: any; 
  options?: { label: string; value: any }[]; 
  groups?: { group: string; items: { code: string; name: string }[] }[];
  onChange: (val: any) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = () => {
    if (options) {
      return options.find(o => o.value === value)?.label || 'Chọn...';
    }
    if (groups) {
      for (const g of groups) {
        const item = g.items.find(i => i.code === value);
        if (item) return `${item.code} - ${item.name}`;
      }
    }
    return value || 'Chọn...';
  };

  return (
    <div className="relative group" ref={containerRef}>
      <label className={`text-[10px] font-black uppercase tracking-widest pl-1 mb-2 block transition-colors ${isOpen ? 'text-emerald-600' : 'text-slate-400'}`}>
        {label}
      </label>
      <button
        type="button"
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`w-full bg-slate-50/50 border ${isOpen ? 'border-emerald-500 bg-white ring-8 ring-emerald-500/5 shadow-xl shadow-emerald-500/10' : 'border-slate-100'} rounded-2xl px-5 py-4 text-xs font-bold text-left flex items-center justify-between transition-all outline-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400 font-medium'}>{getDisplayValue()}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} strokeWidth={3} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute z-[100] w-full mt-3 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-900/5 pt-2 pb-2"
          >
            <div className="max-h-[280px] overflow-y-auto px-2 space-y-1 custom-scrollbar">
              {options && options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all ${value === opt.value ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
              {groups && groups.map(g => (
                <div key={g.group} className="space-y-1">
                  <div className="px-4 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50/5 rounded-lg mt-1">{g.group}</div>
                  {g.items.map(item => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => { onChange(item.code); setIsOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all ${value === item.code ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex flex-col">
                        <span className="uppercase">{item.code}</span>
                        <span className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">{item.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, className = '', disabled = false }: { label: string, type?: string, value: any, onChange?: (v: string) => void, className?: string, disabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [inputValue, setInputValue] = useState('');

  // Sync internal input value with external value
  useEffect(() => {
    if (type === 'date') {
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          setInputValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
          const d = new Date(value);
          if (!isNaN(d.getTime())) setViewDate(d);
        }
      } else {
        setInputValue('');
      }
    }
  }, [value, type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTextChange = (val: string) => {
    if (type === 'date') {
      // Allow only digits and slashes
      let cleaned = val.replace(/[^\d/]/g, '');
      
      // Auto-add slashes
      if (cleaned.length === 2 && !val.includes('/')) cleaned += '/';
      if (cleaned.length === 5 && cleaned.split('/').length === 2) cleaned += '/';
      
      // Limit length
      cleaned = cleaned.slice(0, 10);
      setInputValue(cleaned);

      // If valid full date, notify parent
      if (cleaned.length === 10) {
        const [d, m, y] = cleaned.split('/');
        const iso = `${y}-${m}-${d}`;
        const date = new Date(iso);
        if (!isNaN(date.getTime()) && y.length === 4) {
          onChange?.(iso);
          setViewDate(date);
        }
      }
    } else {
      onChange?.(val);
    }
  };

  const selectDate = (day: number, month: number, year: number) => {
    const dStr = day.toString().padStart(2, '0');
    const mStr = (month + 1).toString().padStart(2, '0');
    const iso = `${year}-${mStr}-${dStr}`;
    onChange?.(iso);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Start from Monday (getDay() 0 is Sunday)
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

    return (
      <div className="p-4 w-72">
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-900">
            {monthNames[month]} {year}
          </div>
          <button 
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="text-[9px] font-black text-slate-300 text-center uppercase py-1">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} />;
            
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            const isSelected = value === `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            
            return (
              <button
                key={d}
                type="button"
                onClick={() => selectDate(d, month, year)}
                className={`
                  aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center transition-all
                  ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 
                    isToday ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`group space-y-1.5 ${className} relative`} ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 group-focus-within:text-emerald-600 uppercase tracking-widest pl-1 transition-colors">{label}</label>
      <div className="relative">
        <input 
          type="text"
          disabled={disabled}
          value={type === 'date' ? inputValue : (value || '')}
          placeholder={type === 'date' ? 'DD/MM/YYYY' : ''}
          onChange={e => handleTextChange(e.target.value)}
          onFocus={() => type === 'date' && setIsOpen(true)}
          className={`w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:shadow-xl focus:shadow-emerald-500/5 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed`}
        />
        {type === 'date' && (
          <>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-[210] top-full left-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-900/5"
                >
                  {renderCalendar()}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
