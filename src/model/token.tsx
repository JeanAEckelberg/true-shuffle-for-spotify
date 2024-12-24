"use client"
// Data structure that manages the current active token, caching it in localStorage
export class Token {
    get access_token() { return typeof window !== 'undefined' ? localStorage.getItem('access_token') || null : null; }
    get refresh_token() { return typeof window !== 'undefined' ? localStorage.getItem('refresh_token') || null : null; }
    get expires_in() { return typeof window !== 'undefined' ? localStorage.getItem('refresh_in') || null : null; }
    get expires() { return typeof window !== 'undefined' ? localStorage.getItem('expires') || null : null; }


    static save(token: Token) : void {
        const { access_token, refresh_token, expires_in } = token;
        localStorage.setItem('access_token', access_token || "");
        localStorage.setItem('refresh_token', refresh_token || "");
        localStorage.setItem('expires_in', (expires_in || 0).toString());

        const now = new Date();
        const expiry = new Date(now.getTime() + ((parseInt(expires_in||"0")) * 1000));
        localStorage.setItem('expires', expiry.toString());
    }

}