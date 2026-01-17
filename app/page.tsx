import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-euro-gray">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-euro-green rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Euro Metal Roofing</h1>
          <p className="text-euro-gray-light mt-2">Project Tracking System</p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md mx-4">
          <h2 className="text-xl font-semibold text-euro-gray mb-4">Welcome</h2>
          <p className="text-gray-600 mb-6">
            If you&apos;re a customer, please use the tracking link sent to you via SMS.
          </p>
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500 mb-4">Dispatcher Access:</p>
            <Link
              href="/admin"
              className="inline-block bg-euro-green text-white px-6 py-3 rounded-lg font-medium hover:bg-euro-green-dark transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-sm">
          <p>Questions? Call us at 613-297-8822</p>
          <p>info@eurometalroofing.ca</p>
        </div>
      </div>
    </div>
  );
}
