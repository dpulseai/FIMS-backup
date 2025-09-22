import React, { useState } from 'react';
import { FileText, School, Users, Building } from 'lucide-react';

interface FormData {
  inspectionDate: string;
  districtName: string;
  talukaName: string;
  centerName: string;
  schoolName: string;
  managementName: string;
  principalName: string;
  udiseNumber: string;
  totalBoys: string;
  totalGirls: string;
  totalStudents: string;
  approvedTeachers: string;
  workingTeachers: string;
  vacantTeachers: string;
  approvedNonTeaching: string;
  workingNonTeaching: string;
  vacantNonTeaching: string;
}

const MumbaiNyayalayForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    inspectionDate: '',
    districtName: '',
    talukaName: '',
    centerName: '',
    schoolName: '',
    managementName: '',
    principalName: '',
    udiseNumber: '',
    totalBoys: '',
    totalGirls: '',
    totalStudents: '',
    approvedTeachers: '',
    workingTeachers: '',
    vacantTeachers: '',
    approvedNonTeaching: '',
    workingNonTeaching: '',
    vacantNonTeaching: ''
  });

  const [responses, setResponses] = useState<{[key: number]: {current: string, measures: string, feedback: string}}>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResponseChange = (index: number, field: 'current' | 'measures' | 'feedback', value: string) => {
    setResponses(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const inspectionDetails = [
    "1] शाळा इमारत बांधकाम वर्ष.",
    "2] (अ) शाळा बांधकाम प्रकार:",
    "1.आर.सी.सी.बांधकाम",
    "2. पत्र्याचे बांधकाम / कौलारू बांधकाम",
    "(ब) शाळा बांधकाम स्थिती:",
    "1.सुस्थितीत आहे काय?",
    "2.दुरुस्तीची गरज आहे का? असल्यास काय दुरुस्ती",
    "3] विद्यार्थ्यांच्या प्रमाणात वर्ग खोल्या आहेत का?",
    "१. आवश्यक खोल्यांची संख्या.",
    "२. उपलब्ध खोल्यांची संख्या",
    "३. नव्याने आवश्यक असणाऱ्या खोल्यांची संख्या",
    "४. खोल्या सुरक्षितीत आहे का?",
    "५. दुरुस्ती आवश्यक आहे का? असल्यास काय दुरुस्ती?",
    "4] मुलांसाठी व मुलींसाठी स्वतंत्र स्वच्छतागृह उपलब्ध आहे का ?",
    "१. विद्यार्थी संख्येच्या प्रमाणात स्वच्छतागृहे उपलब्ध आहे का ?",
    "२. शौचालयांची नियमित स्वच्छता होते का ?",
    "३. शौचालयांमध्ये पाण्याची मुलभूत सोय आहे का ?",
    "5] विशेष गरजा असणाऱ्या विद्यार्थ्यांसाठी (CWSN) स्वच्छतागृह आहे का ?",
    "१. शौचालयाची नियमित स्वच्छता होते का ?",
    "२. शौचालयामध्ये पाण्याची मुलभूत सोय आहे का ?",
    "6] मुलांना पिण्याचे स्वच्छ पाणी व वापरासाठी पाणी पुरेशा प्रमाणात उपलब्ध आहे काय ?",
    "१. पाणी साठवण्यासाठी टाकी उपलब्ध आहे का ? असल्यास क्षमता (लिटर मध्ये)",
    "२. पाणी साठवणुकीच्या प्रकार (पिपा, जार, इ.)",
    "३. पाणी साठवणुकीच्या टाकीची स्वच्छता करणेत येते का? किती दिवसांनी ?",
    "7] शाळेला संरक्षक भिंत आहे का ?",
    "१. पक्की भिंत / तारेचे कुंपण ?",
    "२. संरक्षक भिंत सुस्थितीत आहे का ?",
    "8] मुलांना खेळण्यासाठी मैदान",
    "१. मैदानाची स्थिती,",
    "२. स्वतःचे / खाजगी जागा / सार्वजनिक",
    "३. क्षेत्रफळ किती ?",
    "9] किचनशेड उपलब्ध आहे का ? व सद्यस्थिती.",
    "१. स्वच्छता आहे का ?",
    "10] उताराचा रस्ता (रॅम्प) आहे का ?",
    "१. निकषा प्रमाणे आहे का ? (उतार १:१२)",
    "२. दोन्ही बाजूस कठडे आहेत का ?",
    "11] शाळेमध्ये लाईटची सोय आहे का ?",
    "१. सर्व खोल्यांमध्ये वीज उपलब्ध आहे का ?",
    "२. वीज बिल भरणा न केल्यामुळे बंद आहे काय ?",
    "३. वीज जोडणी / दुरुस्ती आवश्यक असणाऱ्या खोल्यांची संख्या.",
    "४.शाळेचे पंखे व लाईट्स सुस्थितीत आहेत का ?",
    "12] विद्यार्थ्यांना बसण्यासाठी बैठक व्यवस्था.",
    "१. बेंचवर / फरशीवर / जमिनीवर,",
    "२. उपलब्ध बेंच संख्या",
    "३. आवश्यक बेंच संख्या",
    "४. कमी असणाऱ्या बेंच संख्या",
    "५.मुलांना बसण्याचे बेंचची स्थिती काय आहे?",
    "13] शाळा व शाळा परिसर स्वच्छ आहे का?",
    "१. वर्ग खोल्या,",
    "२. इमारत",
    "३. मैदान / शाळेचा परिसर",
    "४.वर्गखोल्यांची रंगरंगोटी आहे का ?",
    "५.वर्गखोल्यांचा वापर शैक्षणिक कामकाजासाठीच होतो का ? इतर कामांसाठी उदा. शेळ्या बांधणे, स्टोअर रूम अन्य व्यक्तीने अतिक्रमण इत्यादी",
    "14] शाळा इमारतींचा / शाळा परिसराचा वापर नागरिकांकडून अवैध कामांसाठी करण्यात येतो का ?",
    "१. कायदा व सुव्यवस्थेचा प्रश्न उद्भवतो का ? पोलिस प्रशासनाने दखल घेऊन बंदोबस्त करणे आवश्यक आहे का ?",
    "15] शाळेच्या इमारत व जागेवर अतिक्रमण झाले आहे का ? असल्यास काय स्थिती.",
    "16] भौतिक सुविधा व इतर बाबींबाबत उल्लेखनीय काम असल्यास उल्लेख करावा."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-t-4 border-blue-600">
          <div className="flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-2xl font-bold text-gray-800 text-center leading-tight">
              मा. उच्च न्यायालय, मुंबई, औरंगाबाद खंडपीठ यांनी सुमोटो जनहित याचिका (S.M.P.I.L.) क्र. १/२०१८ मध्ये दि. २२/०८/२०२४ मध्ये पारित केलेल्या आदेशानुसार गठित जिल्हा समितीने प्रत्यक्ष भेटी दरम्यान शाळांची भौतिक सुविधांची तपासणी करण्यासाठी तपासणीचा प्राथमिक नमुना
            </h1>
          </div>
        </div>

        {/* Basic Information Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <School className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">मुलभूत माहिती</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">तपासणी दिनांक</label>
              <input 
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">जिल्हा नाव</label>
              <input 
                type="text"
                value={formData.districtName}
                onChange={(e) => handleInputChange('districtName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">तालुक्याचे नाव</label>
              <input 
                type="text"
                value={formData.talukaName}
                onChange={(e) => handleInputChange('talukaName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">केंद्राचे नाव</label>
              <input 
                type="text"
                value={formData.centerName}
                onChange={(e) => handleInputChange('centerName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">शाळेचे नाव</label>
              <input 
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">व्यवस्थापनाचे नाव- जिल्हा परिषद / म.न.पा / न.पा.</label>
              <input 
                type="text"
                value={formData.managementName}
                onChange={(e) => handleInputChange('managementName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">मुख्याध्यापकाचे नाव</label>
              <input 
                type="text"
                value={formData.principalName}
                onChange={(e) => handleInputChange('principalName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">युडायस नं.</label>
              <input 
                type="text"
                value={formData.udiseNumber}
                onChange={(e) => handleInputChange('udiseNumber', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Statistics Table */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">आकडेवारी</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <th className="border border-blue-300 p-4 text-sm font-medium">विद्यार्थी संख्या एकूण मुले</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">विद्यार्थी संख्या एकूण मुली</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">एकूण विद्यार्थी संख्या</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">एकूण मंजूर शिक्षक संख्या</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">कार्यरत शिक्षक संख्या</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">रिक्त शिक्षक संख्या</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">एकूण मंजूर शिक्षकेत्तर कर्मचारी संख्या</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">एकूण कार्यरत शिक्षकेत्तर कर्मचारी संख्या</th>
                  <th className="border border-blue-300 p-4 text-sm font-medium">रिक्त शिक्षकेत्तर कर्मचारी संख्या</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.totalBoys}
                      onChange={(e) => handleInputChange('totalBoys', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.totalGirls}
                      onChange={(e) => handleInputChange('totalGirls', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.totalStudents}
                      onChange={(e) => handleInputChange('totalStudents', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.approvedTeachers}
                      onChange={(e) => handleInputChange('approvedTeachers', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.workingTeachers}
                      onChange={(e) => handleInputChange('workingTeachers', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.vacantTeachers}
                      onChange={(e) => handleInputChange('vacantTeachers', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.approvedNonTeaching}
                      onChange={(e) => handleInputChange('approvedNonTeaching', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.workingNonTeaching}
                      onChange={(e) => handleInputChange('workingNonTeaching', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input 
                      type="number"
                      value={formData.vacantNonTeaching}
                      onChange={(e) => handleInputChange('vacantNonTeaching', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Inspection Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Building className="w-8 h-8 text-orange-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">तपशीलवार तपासणी</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <th className="border border-orange-300 p-4 text-sm font-medium w-16">अ.क्र</th>
                  <th className="border border-orange-300 p-4 text-sm font-medium w-2/5">तपशील</th>
                  <th className="border border-orange-300 p-4 text-sm font-medium w-1/5">सध्यस्थिती</th>
                  <th className="border border-orange-300 p-4 text-sm font-medium w-1/5">करावयाच्या उपाययोजना</th>
                  <th className="border border-orange-300 p-4 text-sm font-medium w-1/5">अभिप्राय</th>
                </tr>
              </thead>
              <tbody>
                {inspectionDetails.map((detail, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="border border-gray-200 p-4 text-center font-medium text-gray-600">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 p-4 align-top">
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {detail}
                      </div>
                    </td>
                    <td className="border border-gray-200 p-4">
                      <textarea
                        value={responses[index]?.current || ''}
                        onChange={(e) => handleResponseChange(index, 'current', e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 resize-none transition-all"
                        placeholder="सध्यस्थिती लिहा..."
                      />
                    </td>
                    <td className="border border-gray-200 p-4">
                      <textarea
                        value={responses[index]?.measures || ''}
                        onChange={(e) => handleResponseChange(index, 'measures', e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 resize-none transition-all"
                        placeholder="उपाययोजना लिहा..."
                      />
                    </td>
                    <td className="border border-gray-200 p-4">
                      <textarea
                        value={responses[index]?.feedback || ''}
                        onChange={(e) => handleResponseChange(index, 'feedback', e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 resize-none transition-all"
                        placeholder="अभिप्राय लिहा..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button 
            type="submit"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            तपासणी सबमिट करा
          </button>
        </div>
      </div>
    </div>
  );
};

export default MumbaiNyayalayForm;