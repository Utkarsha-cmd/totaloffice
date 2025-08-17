import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Agreement {
  id: string
  name: string
  content: {
    title: string
    terms: string[]
    termination: string
    forceMajeure: string
    acceptance: string
  }
  package: {
    name: string
    cost: string
  }
}

interface FormData {
  title: string
  forename: string
  surname: string
  email: string
  contactNumber: string
  address1: string
  address2: string
  townCity: string
  postcode: string
  date: string
  signature: string
  printName: string
}

const agreements: Agreement[] = [
  {
    id: "infinity",
    name: "INFINITY Service Agreement",
    content: {
      title: "INFINITY Service Agreement",
      terms: [
        "The subscription to Infinity is for a minimum 12-month period from the date of joining, unless paying upfront for 3 years.",
        "Subscriptions can be paid monthly (12 consecutive payments required annually or every 3 years.)",
        "A subscription entitles subscribers to a maintained printer with unlimited ink cartridges, for a minimum period of 12 months (or 3 years if paid upfront for 3 years).",
        "If payment is provided upfront for the first 12 months, we will give you 1 month free. If payment is provided upfront for 3 years, we will give you 6 months free.",
        "The printer and associated printer cartridges supplied for Infinity, shall remain the property of MY Total Office Solutions at all times.",
        "The printers supplied to subscribers as part of Infinity may be refurbished.",
        "If a printer fails for any reason, MY Total Office Solutions should be notified as soon as possible.",
        "Subscriptions are not transferable to any other parties.",
        "Subscriptions are only for use by a single household.",
        "Subscriptions and the printers and printer cartridges are only for home use.",
        "The printer and associated printer cartridges are not for resale.",
        "Only printer cartridges supplied by MY Total Office Solutions can be used with Infinity.",
        "Subscriptions will automatically continue after the 12-month period unless one month's notice to terminate is received.",
        "Termination will only be accepted with the return of any supplied printer and printer cartridges in complete working order.",
        "MY Total Office Solutions reserves the right to change subscription pricing at any time.",
        "MY Total Office Solutions reserves the right to refuse or cancel a subscription.",
      ],
      termination:
        "MY Total Office Solutions reserves the right to terminate a subscription at its sole discretion during the term of a subscription. If a payment is missed the subscription is frozen and no replacement printer cartridges will be permitted while frozen.",
      forceMajeure:
        "Neither party will be liable for any delay in performing or failure to perform its obligations under this Agreement due to any cause outside its reasonable control.",
      acceptance:
        'By ticking the "Agree to the terms & conditions" and applying to join Infinity, you hereby confirm and accept that you shall not hold MY Total Office Solutions responsible for any damage howsoever caused.',
    },
    package: {
      name: "INFINITY – MONTHLY SUBSCRIPTION",
      cost: "£11.99 PER MONTH",
    },
  },
  {
    id: "premium",
    name: "PREMIUM Service Agreement",
    content: {
      title: "PREMIUM Service Agreement",
      terms: [
        "The subscription to Premium is for a minimum 24-month period from the date of joining.",
        "Subscriptions include premium printer maintenance and high-capacity ink cartridges.",
        "Premium subscribers receive priority technical support and same-day replacement service.",
        "All equipment remains the property of MY Total Office Solutions.",
        "Premium service includes quarterly maintenance visits.",
        "Subscriptions are non-transferable and for single business use only.",
        "Commercial usage is permitted under Premium agreements.",
        "Premium subscribers receive advanced reporting and usage analytics.",
        "Automatic renewal applies unless 60 days notice is provided.",
        "Premium agreements include damage protection coverage.",
      ],
      termination:
        "Premium subscriptions require 60 days written notice for termination. Early termination fees may apply for contracts terminated before the minimum term.",
      forceMajeure:
        "Neither party will be liable for delays due to circumstances beyond reasonable control, including but not limited to natural disasters, government actions, or supply chain disruptions.",
      acceptance:
        "By signing this Premium Service Agreement, you acknowledge understanding of all terms and agree to the enhanced service level commitments.",
    },
    package: {
      name: "PREMIUM – BUSINESS SUBSCRIPTION",
      cost: "£29.99 PER MONTH",
    },
  },
  {
    id: "enterprise",
    name: "ENTERPRISE Service Agreement",
    content: {
      title: "ENTERPRISE Service Agreement",
      terms: [
        "Enterprise agreements are customized for large-scale operations with flexible terms.",
        "Multi-location support with centralized billing and management.",
        "Dedicated account manager and 24/7 technical support included.",
        "Volume-based pricing with quarterly usage reviews.",
        "Enterprise-grade security and compliance features included.",
        "Custom SLA agreements with guaranteed response times.",
        "Integration support for existing IT infrastructure.",
        "Quarterly business reviews and optimization consultations.",
        "Flexible contract terms from 12 to 60 months available.",
        "White-label options available for reseller partners.",
      ],
      termination:
        "Enterprise agreements include custom termination clauses negotiated during contract setup. Standard notice period is 90 days with potential early termination fees.",
      forceMajeure:
        "Enterprise force majeure clauses include additional provisions for business continuity and disaster recovery scenarios.",
      acceptance:
        "Enterprise agreements require executive sign-off and legal review. By signing, authorized representatives confirm organizational commitment to the service terms.",
    },
    package: {
      name: "ENTERPRISE – CUSTOM SUBSCRIPTION",
      cost: "CUSTOM PRICING",
    },
  },
]

function Quote() {
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null)
  const [currentPage, setCurrentPage] = useState<"selection" | "customer" | "company">("selection")
  const [formData, setFormData] = useState<FormData>({
    title: "",
    forename: "",
    surname: "",
    email: "",
    contactNumber: "",
    address1: "",
    address2: "",
    townCity: "",
    postcode: "",
    date: new Date().toISOString().split("T")[0],
    signature: "",
    printName: "",
  })
  const { toast } = useToast()

  const handleAgreementSelect = (agreement: Agreement) => {
    setSelectedAgreement(agreement)
    setCurrentPage("customer")
  }

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSend = () => {
    const requiredFields = [
      "title",
      "forename",
      "surname",
      "email",
      "contactNumber",
      "address1",
      "townCity",
      "postcode",
      "signature",
      "printName",
    ]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof FormData])
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before sending.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Agreement Sent",
      description: `Agreement sent successfully to ${formData.forename} ${formData.surname} at ${formData.email}`,
    })

    setCurrentPage("selection")
    setSelectedAgreement(null)
    setFormData({
      title: "",
      forename: "",
      surname: "",
      email: "",
      contactNumber: "",
      address1: "",
      address2: "",
      townCity: "",
      postcode: "",
      date: new Date().toISOString().split("T")[0],
      signature: "",
      printName: "",
    })
  }

  return (
    <div className="container mx-auto p-6 bg-white text-black min-h-screen">
      <div className="max-w-4xl mx-auto">
        {currentPage === "selection" && (
          <>
            <h1 className="text-3xl font-bold text-center mb-8">Select Service Agreement</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agreements.map((agreement) => (
                <Card key={agreement.id} className="cursor-pointer hover:shadow-lg transition-shadow bg-emerald-50 border border-emerald-200 hover:border-emerald-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800">{agreement.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">Package: {agreement.package.name}</p>
                    <p className="text-lg text-emerald-600 font-semibold mb-4">{agreement.package.cost}</p>
                    <Button onClick={() => handleAgreementSelect(agreement)} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                      Select Agreement
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {currentPage !== "selection" && selectedAgreement && (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button
               className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
               onClick={() => setCurrentPage("selection")}>
                ← Back to Selection
              </Button>
              <div className="flex gap-2">
                <Button
                  className={`border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    currentPage === "customer" 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-800"
                  }`}
                  onClick={() => setCurrentPage("customer")}
                >
                  Customer Copy
                </Button>
                <Button
                  className={`border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    currentPage === "company" 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-800"
                  }`}
                  onClick={() => setCurrentPage("company")}
                >
                  Company Copy
                </Button>
              </div>
            </div>

            <Card className="bg-white border border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">{selectedAgreement.content.title}</CardTitle>
                <p className="text-sm text-gray-500">
                  {currentPage === "customer" ? "Customer Copy" : "Company Copy - Please retain signed copy"}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-600">Terms & Conditions</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {selectedAgreement.content.terms.map((term, index) => (
                        <li key={index}>{term}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-gray-800">Subscription Termination Policy</h3>
                    <p className="text-sm text-gray-600">{selectedAgreement.content.termination}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-gray-800">Force Majeure</h3>
                    <p className="text-sm text-gray-600">{selectedAgreement.content.forceMajeure}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2  text-gray-800">Acceptance of Terms and Conditions</h3>
                    <p className="text-sm  text-gray-600">{selectedAgreement.content.acceptance}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm font-medium mb-4  text-gray-800">
                    BY SIGNING BELOW, YOU AGREE TO PURCHASE THE MANAGED PRINT SERVICES SPECIFIED ABOVE.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label  className="text-gray-900 font-semibold">Title *</Label>
                      <Select value={formData.title} onValueChange={(value) => handleFormChange("title", value)}>
                        <SelectTrigger className="border border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white">
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-emerald-300">
                          <SelectItem className="text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-100 focus:text-emerald-800" value="Mr">Mr</SelectItem>
                          <SelectItem className="text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-100 focus:text-emerald-800" value="Mrs">Mrs</SelectItem>
                          <SelectItem className="text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-100 focus:text-emerald-800" value="Miss">Miss</SelectItem>
                          <SelectItem className="text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-100 focus:text-emerald-800" value="Ms">Ms</SelectItem>
                          <SelectItem className="text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-100 focus:text-emerald-800" value="Dr">Dr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">Forename *</Label>
                      <Input  className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                      value={formData.forename} onChange={(e) => handleFormChange("forename", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">Surname *</Label>
                      <Input className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                      value={formData.surname} onChange={(e) => handleFormChange("surname", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">Email *</Label>
                      <Input className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                      type="email" value={formData.email} onChange={(e) => handleFormChange("email", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">Contact Number *</Label>
                      <Input  className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                      value={formData.contactNumber} onChange={(e) => handleFormChange("contactNumber", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">1st Line Address *</Label>
                      <Input className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                       value={formData.address1} onChange={(e) => handleFormChange("address1", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">2nd Line Address</Label>
                      <Input className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                       value={formData.address2} onChange={(e) => handleFormChange("address2", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">Town/City *</Label>
                      <Input  className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white" 
                      value={formData.townCity} onChange={(e) => handleFormChange("townCity", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">Postcode *</Label>
                      <Input className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white "
                       value={formData.postcode} onChange={(e) => handleFormChange("postcode", e.target.value)} />
                    </div>

                    <div>
                      <Label  className="text-gray-900 font-semibold">Date</Label>
                      <Input className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                      type="date" value={formData.date} onChange={(e) => handleFormChange("date", e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted rounded-lg bg-white  border border-black">
                    <p className="font-medium text-gray-900 bg-white">{selectedAgreement.package.name}</p>
                    <p className="text-lg text-gray-900 font-bold text-primary bg-white">{selectedAgreement.package.cost}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div>
                      <Label  className="text-gray-900 font-semibold">Signed *</Label>
                      <Textarea   className="p-2 border border-black  focus:outline-none font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                      value={formData.signature} onChange={(e) => handleFormChange("signature", e.target.value)} rows={3} />
                    </div>

                    <div>
                      <Label className="text-gray-900 font-semibold">Print Name *</Label>
                      <Input value={formData.printName}
                       className="p-2 border border-black font-semibold text-gray-800 rounded bg-white autofill:bg-white"
                      onChange={(e) => handleFormChange("printName", e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-4">
                      <p className="font-medium">MY Total Office Solutions</p>tfd
                      <p>Unit 6 The Courtyard, Grane Road, Haslingden, LANCS, BB4 4QN</p>
                      <p>t: 0800 1833 800 | e: info@mytotalofficesolutions.com</p>
                      <p>w: https://mytotalofficesolutions.co.uk</p>
                    </div>

                    <Button onClick={handleSend} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                      Send Agreement to Customer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default Quote
