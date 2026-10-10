const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const ScratchStrategy = require('../strategies/scratch');
const SoundCloudStrategy = require('../strategies/soundcloud');
const MicrosoftStrategy = require('passport-microsoft').Strategy;

const configurePassport = () => {
    // Passport serialization
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    // Discord Strategy
    if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
        passport.use(new DiscordStrategy({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL || 'http://localhost:3000'}/auth/discord/callback`,
            scope: ['identify', 'email']
        }, (accessToken, refreshToken, profile, done) => {
            const user = {
                ...profile,
                provider: 'discord'
            };
            return done(null, user);
        }));
    }

    // Google Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL || 'http://localhost:3000'}/auth/google/callback`
        }, (accessToken, refreshToken, profile, done) => {
            const user = {
                id: profile.id,
                username: profile.displayName,
                displayName: profile.displayName,
                name: profile.name,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                provider: 'google'
            };
            return done(null, user);
        }));
    }

    // GitHub Strategy
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL.replace("https", "http") || 'http://localhost:3000'}/auth/github/callback`
        }, (accessToken, refreshToken, profile, done) => {
            const user = {
                id: profile.id,
                username: profile.username || profile._json.login,
                name: profile._json.name,
                email: profile.emails ? profile.emails[0].value : null,
                avatar: profile.photos[0].value,
                bio: profile._json.bio,
                provider: 'github',
                github: {
                    login: profile._json.login,
                    url: profile._json.html_url,
                    public_repos: profile._json.public_repos,
                    followers: profile._json.followers,
                    following: profile._json.following,
                    created_at: profile._json.created_at
                }
            };
            return done(null, user);
        }));
    }

    // Scratch Strategy (no credentials needed)
    passport.use(new ScratchStrategy({}, (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }));

    // SoundCloud Strategy
    if (process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET) {
        passport.use(new SoundCloudStrategy({
            clientID: process.env.SOUNDCLOUD_CLIENT_ID,
            clientSecret: process.env.SOUNDCLOUD_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL || 'http://localhost:3000'}/auth/soundcloud/callback`
        }, (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }));
    }

    // Microsoft Strategy
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
        passport.use(new MicrosoftStrategy({
            clientID: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL || 'http://localhost:3000'}/auth/microsoft/callback`,
            scope: ['user.read']
        }, (accessToken, refreshToken, profile, done) => {
            const user = {
                id: profile.id,
                username: profile.displayName,
                displayName: profile.displayName,
                email: profile.emails?.[0]?.value ?? null,
                avatar: null,
                provider: 'microsoft'
            };
            return done(null, user);
        }));
    }
};

module.exports = configurePassport;
