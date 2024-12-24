import {Token} from "@/model/token";

export class SpotifyRepository {
    private readonly ClientId: string = "f40066a8358b4d289e44fdf7f0fc8aca";
    private authorizationEndpoint: string = "https://accounts.spotify.com/authorize";
    private tokenEndpoint: string = "https://accounts.spotify.com/api/token";
    private scope: string = 'user-read-private user-read-email';
    public redirectUrl: string = "https://JeanAEckelberg.github.io/true-shuffle-for-spotify";
    public currentToken: Token = new Token()
    public code: string | null = null;


    public constructor() {
        // On page load, try to fetch auth code from current browser search URL
        const args: URLSearchParams = new URLSearchParams(window.location.search);
        this.code = args.get('code');
    }

    // Spotify API Calls
    public async getToken(): Promise<void> {
        const code_verifier = localStorage.getItem('code_verifier');

        const token = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.ClientId || "",
                grant_type: 'authorization_code',
                code: this.code || "",
                redirect_uri: this.redirectUrl,
                code_verifier: code_verifier || "",
            }),
        }).then(response => response.json() as Promise<Token>);

        Token.save(token);
    }

    public async refreshToken(): Promise<void> {
        const token: Token = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: this.ClientId || "",
                grant_type: 'refresh_token',
                refresh_token: this.currentToken.refresh_token || ""
            }),
        }).then(response => response.json() as Promise<Token>);

        Token.save(token)
    }

    public async redirectToSpotifyAuthorize(): Promise<void> {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomValues = crypto.getRandomValues(new Uint8Array(64));
        const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

        const code_verifier = randomString;
        const data = new TextEncoder().encode(code_verifier);
        const hashed = await crypto.subtle.digest('SHA-256', data);

        const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        window.localStorage.setItem('code_verifier', code_verifier);

        const authUrl = new URL(this.authorizationEndpoint)
        const params = {
            response_type: 'code',
            client_id: this.ClientId || "",
            scope: this.scope,
            code_challenge_method: 'S256',
            code_challenge: code_challenge_base64,
            redirect_uri: this.redirectUrl,
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
    }

    public async getUserData(): Promise<unknown> {
        const response = await fetch("https://api.spotify.com/v1/me", {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + this.currentToken.access_token },
        });

        return await response.json();
    }
}





