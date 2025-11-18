export default function SecurityBanner() {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="flex items-center">
          {/* Scrolling Message Container */}
          <div className="flex-1 overflow-hidden relative">
            <div className="scroll-banner whitespace-nowrap text-sm text-red-800 font-semibold flex items-center">
              <span className="text-red-600">UPDATES:</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
              <span className="text-red-600">Be alert: A targeted phishing scam is circulating via SMS, falsely claiming "non-delivery due to failed attempts" and redirecting users to fraudulent websites.</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
              <span className="text-red-600">Please do not transfer money to payment links that are not shared from official accounts.</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
              <span className="text-red-600">We do not require OTP or credentials for address confirmation for your delivery.</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
              
              {/* Duplicate for seamless loop */}
              <span className="text-red-600">UPDATES:</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
              <span className="text-red-600">Be alert: A targeted phishing scam is circulating via SMS, falsely claiming "non-delivery due to failed attempts" and redirecting users to fraudulent websites.</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
              <span className="text-red-600">Please do not transfer money to payment links that are not shared from official accounts.</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
              <span className="text-red-600">We do not require OTP or credentials for address confirmation for your delivery.</span>
              <div className="w-3 h-3 bg-red-500 mx-4 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
