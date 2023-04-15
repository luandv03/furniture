import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "./page.module.css";
import { GoogleOAuth2 } from "@/components/GoogleOAuth2/GoogleOAuth2";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    return (
        <main className={styles.main}>
            <GoogleOAuth2 />
        </main>
    );
}
