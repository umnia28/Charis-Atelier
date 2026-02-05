import RequireAuth from "@/components/RequireAuth";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <div className="p-6">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p>Only logged-in users can see this.</p>
      </div>
    </RequireAuth>
  );
}
