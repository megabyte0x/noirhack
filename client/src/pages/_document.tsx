import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body>
                {/* Script to prevent ethereum provider conflicts */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                // Prevent multiple providers from trying to modify window.ethereum
                if (typeof window !== 'undefined' && !window.ethereum) {
                  Object.defineProperty(window, 'ethereum', {
                    value: null,
                    writable: true,
                    configurable: true
                  });
                }
              })();
            `,
                    }}
                />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
} 