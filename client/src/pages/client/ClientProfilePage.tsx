export default function ClientProfilePage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-gray-600">Public information and progress</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div>Email: —</div>
            <div>Gender: —</div>
            <div>Age: —</div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Progress Chart</h3>
          <div className="h-48 grid place-items-center text-gray-500">No data available yet</div>
        </div>
      </div>
    </section>
  );
}