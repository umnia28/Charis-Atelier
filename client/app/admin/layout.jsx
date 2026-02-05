import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "CharisAtelier - Admin",
    description: "CharisAtelier - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
