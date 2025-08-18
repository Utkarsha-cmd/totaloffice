import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, File, Calendar, Edit3, Check, X, Download, Upload, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

const ServiceAgreementsTab: React.FC = () => {
  type AgreementFile = {
    id: string;
    fileName: string;
    title: string;
    size: number;
    uploadedAt: string;
    url?: string;
  };

  type ServiceAgreementData = {
    id: string;
    customerName: string;
    companyName: string;
    serviceName: string;
    agreement: AgreementFile | null;
  };

  const mockAgreements: ServiceAgreementData[] = [
    {
      id: "1",
      customerName: "John Smith",
      companyName: "Tech Corp Solutions",
      serviceName: "Cloud Infrastructure",
      agreement: {
        id: "file1",
        fileName: "tech-corp-cloud-agreement.pdf",
        title: "Cloud Infrastructure Service Agreement",
        size: 2048576,
        uploadedAt: "2024-01-15T10:30:00Z",
        url: "#",
      },
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      companyName: "Digital Marketing Pro",
      serviceName: "SEO Optimization",
      agreement: {
        id: "file2",
        fileName: "marketing-seo-contract.pdf",
        title: "SEO Service Contract",
        size: 1536000,
        uploadedAt: "2024-01-10T14:20:00Z",
        url: "#",
      },
    },
    {
      id: "3",
      customerName: "Michael Brown",
      companyName: "Brown & Associates",
      serviceName: "Legal Consultation",
      agreement: null,
    },
    {
      id: "4",
      customerName: "Emily Davis",
      companyName: "Creative Designs Ltd",
      serviceName: "Web Development",
      agreement: {
        id: "file4",
        fileName: "creative-web-dev-agreement.docx",
        title: "Web Development Agreement",
        size: 985600,
        uploadedAt: "2023-12-20T09:15:00Z",
        url: "#",
      },
    },
    {
      id: "6",
      customerName: "Robert Wilson",
      companyName: "Wilson Consulting",
      serviceName: "Business Strategy",
      agreement: {
        id: "file5",
        fileName: "wilson-strategy-contract.pdf",
        title: "Strategic Consulting Agreement",
        size: 3072000,
        uploadedAt: "2024-01-20T16:45:00Z",
        url: "#",
      },
    },

  ];

  const [agreements, setAgreements] = useState<ServiceAgreementData[]>(mockAgreements);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitles, setTempTitles] = useState<Record<string, string>>({});
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle && inputRef.current) {
      // Force remove yellow background
      const input = inputRef.current;
      input.style.setProperty('background-color', 'white', 'important');
      input.style.setProperty('box-shadow', '0 0 0 1000px white inset', 'important');
      input.style.setProperty('-webkit-box-shadow', '0 0 0 1000px white inset', 'important');
      input.style.setProperty('-webkit-text-fill-color', 'black', 'important');
      input.style.setProperty('border-color', '#d1d5db', 'important'); // gray-300
      input.style.setProperty('--tw-ring-color', 'transparent', 'important');
    }
  }, [editingTitle]);

  const handleTitleUpdate = (id: string, newTitle: string) => {
    setAgreements(prev =>
      prev.map(agreement =>
        agreement.id === id && agreement.agreement
          ? { ...agreement, agreement: { ...agreement.agreement, title: newTitle } }
          : agreement
      )
    );
    setEditingTitle(null);
    setTempTitles(prev => ({ ...prev, [id]: "" }));
  };

  const handleFileUpload = async (id: string, file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only PDF and Word documents are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10 MB limit.");
      return;
    }

    setUploadingIds(prev => new Set(prev).add(id));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newAgreement: AgreementFile = {
        id: `file-${Date.now()}`,
        fileName: file.name,
        title: file.name.replace(/\.[^/.]+$/, ""),
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: "#",
      };

      setAgreements(prev =>
        prev.map(agreement =>
          agreement.id === id ? { ...agreement, agreement: newAgreement } : agreement
        )
      );
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDownload = (agreement: AgreementFile) => {
    const link = document.createElement("a");
    link.href = "#";
    link.download = agreement.fileName;
    link.click();
  };

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredAgreements = agreements.filter(agreement => {
    const matchesSearch =
      agreement.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.agreement?.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAgreements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgreements = filteredAgreements.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 text-gray-700 w-full max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Manage customer service agreements and contracts</p>
        </div>

      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border border-gray-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto max-h-[600px] w-full">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-500 sticky top-0 z-10 border-b-2 border-emerald-500">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Customer / Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Agreement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAgreements.length > 0 ? (
                currentAgreements.map((data) => (
                  <tr key={data.id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{data.customerName}</div>
                        <div className="text-sm text-gray-600">{data.companyName}</div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-6 py-4">
                      <span>{data.serviceName}</span>
                    </td>

                    {/* Agreement */}
                    <td className="px-6 py-4">
                      {data.agreement ? (
                        <div className="space-y-2">
                          {editingTitle === data.id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                ref={inputRef}
                                value={tempTitles[data.id] || data.agreement.title}
                                onChange={(e) =>
                                  setTempTitles(prev => ({ ...prev, [data.id]: e.target.value }))
                                }
                                className="h-8 text-sm text-gray-600 border border-gray-300 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 bg-white"
                                style={{
                                  WebkitBoxShadow: '0 0 0 1000px white inset',
                                  WebkitTextFillColor: '#4b5563',
                                  boxShadow: '0 0 0 1000px white inset',
                                  backgroundColor: 'white !important',
                                  borderColor: '#d1d5db !important',
                                  outline: 'none',
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleTitleUpdate(data.id, tempTitles[data.id] || "");
                                  if (e.key === "Escape") {
                                    setEditingTitle(null);
                                    setTempTitles(prev => ({ ...prev, [data.id]: "" }));
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleTitleUpdate(data.id, tempTitles[data.id] || "")
                                }
                                disabled={!tempTitles[data.id]?.trim()}
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTitle(null);
                                  setTempTitles(prev => ({ ...prev, [data.id]: "" }));
                                }}
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <File className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800">{data.agreement.title}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setTempTitles(prev => ({
                                    ...prev,
                                    [data.id]: data.agreement!.title,
                                  }));
                                  setEditingTitle(data.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-0"
                                style={{ backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                                  e.currentTarget.style.color = '#374151';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '';
                                }}
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}

                          {/* File Info */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="text-xs text-gray-500">{formatBytes(data.agreement.size)} • {formatDate(data.agreement.uploadedAt)}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">No agreement uploaded</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {data.agreement && (
                          <Button
                            size="sm"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleDownload(data.agreement!)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}

                        <div className="relative">
                          <input
                            type="file"
                            id={`upload-${data.id}`}
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(data.id, file);
                                e.target.value = "";
                              }
                            }}
                            disabled={uploadingIds.has(data.id)}
                          />
                          <label htmlFor={`upload-${data.id}`}>
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={uploadingIds.has(data.id)}
                              asChild
                            >
                              <span className="text-sm text-gray-600">
                                {data.agreement ? (
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                ) : (
                                  <Upload className="w-4 h-4 mr-1" />
                                )}
                                {uploadingIds.has(data.id)
                                  ? "Uploading..."
                                  : data.agreement
                                  ? "Replace"
                                  : "Upload"}
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm
                      ? "No agreements found matching"
                      : "No service agreements found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredAgreements.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAgreements.length)} of {filteredAgreements.length} agreements
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-600 focus:outline-none focus:ring-0 focus:border-gray-400"
                  style={{ backgroundColor: 'white', borderColor: '#d1d5db' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ecfdf5';
                    e.currentTarget.style.borderColor = '#6ee7b7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 border-emerald-300 focus:outline-none focus:ring-0 ${
                        currentPage === page 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 focus:border-emerald-600' 
                          : 'bg-white hover:bg-emerald-50 text-gray-700 hover:border-emerald-400 focus:border-emerald-400'
                      }`}
                      style={currentPage === page ? 
                        { backgroundColor: '#059669', borderColor: '#059669', color: 'white' } :
                        { backgroundColor: 'white', borderColor: '#a7f3d0', color: '#374151' }
                      }
                      onMouseEnter={(e) => {
                        if (currentPage === page) {
                          e.currentTarget.style.backgroundColor = '#047857';
                        } else {
                          e.currentTarget.style.backgroundColor = '#ecfdf5';
                          e.currentTarget.style.borderColor = '#6ee7b7';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage === page) {
                          e.currentTarget.style.backgroundColor = '#059669';
                        } else {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#a7f3d0';
                        }
                      }}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 border-emerald-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-gray-700 focus:outline-none focus:ring-0 focus:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-300"
                  style={{ backgroundColor: 'white', borderColor: '#a7f3d0' }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#ecfdf5';
                      e.currentTarget.style.borderColor = '#6ee7b7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#a7f3d0';
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAgreementsTab;
