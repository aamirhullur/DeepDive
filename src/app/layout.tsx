import type { Metadata } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const dancingScript = Dancing_Script({
	variable: "--font-dancing-script",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DeepResearch | AI-Powered Research Assistant",
	description: "Generate comprehensive research reports on any topic through interactive AI-powered conversations",
	keywords: "research, AI, reports, deep learning, chatbot",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="scroll-smooth">
			<body
				className={`${inter.variable} ${dancingScript.variable} font-inter antialiased bg-gradient-to-b from-slate-50 to-slate-100`}
			>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
