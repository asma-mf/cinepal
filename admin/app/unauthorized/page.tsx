// Shown when a signed-in user without admin role tries to access /admin
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-gray-400">You need admin privileges to access this area.</p>
      </div>
    </div>
  );
}
