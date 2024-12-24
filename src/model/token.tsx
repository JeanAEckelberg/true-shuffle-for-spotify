// Data structure that manages the current active token, caching it in localStorage
export class Token {
    get access_token() { return localStorage.getItem('access_token') || null; }
    get refresh_token() { return localStorage.getItem('refresh_token') || null; }
    get expires_in() { return localStorage.getItem('refresh_in') || null }
    get expires() { return localStorage.getItem('expires') || null }


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