import { Body, Controller, Post, Get, HttpCode, HttpStatus, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Body('refreshToken') refreshToken: string) {
        return this.authService.logout(refreshToken);
    }

    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    logoutAll(@Request() req: any) {
        return this.authService.logoutAll(req.user.id);
    }

    // Google OAuth
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Request() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Request() req, @Res() res) {
        return this.handleOAuthRedirect(req, res);
    }

    // GitHub OAuth
    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubAuth(@Request() req) { }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    githubAuthRedirect(@Request() req, @Res() res) {
        return this.handleOAuthRedirect(req, res);
    }

    private handleOAuthRedirect(req, res) {
        const { accessToken, refreshToken, user } = req.user;
        // Redirect to frontend with tokens
        // In production, consider using cookies or a temporary code exchange
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(
            `${frontendUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}`,
        );
    }
}
