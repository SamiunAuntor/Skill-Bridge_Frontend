import Footer from "@/Components/Layout/Footer";
import Navbar from "@/Components/Layout/Navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
