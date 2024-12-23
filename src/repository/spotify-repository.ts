export class SpotifyRepository {
    private ClientId: string | undefined;
    private ClientSecret: string | undefined;


    public constructor() {
        this.ClientId = process.env.SPOTIFYCLIENTID;
        this.ClientSecret = process.env.SPOTIFYCLIENTSECRET;
    }
}