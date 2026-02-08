import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flu/core/constants/app_colors.dart';
import 'package:flu/core/constants/app_typography.dart';
import 'package:flu/features/login/presentation/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isSignUp = false;
  bool _obscurePassword = true;
  String _error = '';

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    ref.listen<AuthState>(authProvider, (prev, next) {
      if (next.isAuthenticated && !(prev?.isAuthenticated ?? false)) {
        Navigator.pop(context);
      }
      if (next.error != null && next.error != prev?.error) {
        setState(() {
          _error = next.error!;
        });
        ref.read(authProvider.notifier).clearError();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header with back button
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
              child: Align(
                alignment: Alignment.centerLeft,
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.chevron_left_rounded,
                        size: 18,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Back',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title section
                    Text(
                      _isSignUp ? 'Create Account' : 'Welcome Back',
                      style: AppTypography.sectionLabel.copyWith(
                        fontSize: 12,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isSignUp ? '회원가입' : '로그인',
                      style: AppTypography.heading1.copyWith(
                        fontSize: 30,
                        fontWeight: FontWeight.w500,
                        letterSpacing: -0.5,
                      ),
                    ),

                    const SizedBox(height: 48),

                    // Google Sign-In button - border primary, p-4
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: OutlinedButton(
                        onPressed: authState.isLoading
                            ? null
                            : () {
                                ref
                                    .read(authProvider.notifier)
                                    .signInWithGoogle();
                              },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.textPrimary,
                          side: const BorderSide(color: AppColors.primary),
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                        ),
                        child: authState.isLoading
                            ? SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primary,
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  // Google icon (G letter fallback)
                                  Icon(
                                    Icons.g_mobiledata_rounded,
                                    size: 24,
                                    color: AppColors.textPrimary,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    'Google로 계속하기',
                                    style: AppTypography.bodySmall.copyWith(
                                      fontSize: 14,
                                      color: AppColors.textPrimary,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Divider with "Or"
                    Row(
                      children: [
                        const Expanded(
                          child: Divider(color: AppColors.border, height: 1),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'OR',
                            style: AppTypography.sectionLabel.copyWith(
                              fontSize: 10,
                              letterSpacing: 2.0,
                            ),
                          ),
                        ),
                        const Expanded(
                          child: Divider(color: AppColors.border, height: 1),
                        ),
                      ],
                    ),

                    const SizedBox(height: 32),

                    // Email/Password Form
                    Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Email label
                          Text(
                            'EMAIL',
                            style: AppTypography.sectionLabel.copyWith(
                              fontSize: 10,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 8),
                          // Email input - border, p-4, bg-transparent
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            style: AppTypography.bodySmall.copyWith(
                              fontSize: 14,
                              color: AppColors.textPrimary,
                              letterSpacing: 0.3,
                            ),
                            decoration: InputDecoration(
                              hintText: 'your@email.com',
                              hintStyle: AppTypography.bodySmall.copyWith(
                                fontSize: 14,
                                color: AppColors.textTertiary,
                                letterSpacing: 0.3,
                              ),
                              contentPadding: const EdgeInsets.all(16),
                              filled: false,
                              enabledBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(color: AppColors.border),
                              ),
                              focusedBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(
                                  color: AppColors.primary,
                                ),
                              ),
                              errorBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(color: AppColors.error),
                              ),
                              focusedErrorBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(color: AppColors.error),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Email is required';
                              }
                              if (!value.contains('@')) {
                                return 'Invalid email address';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 16),

                          // Password label
                          Text(
                            'PASSWORD',
                            style: AppTypography.sectionLabel.copyWith(
                              fontSize: 10,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 8),
                          // Password input
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            style: AppTypography.bodySmall.copyWith(
                              fontSize: 14,
                              color: AppColors.textPrimary,
                              letterSpacing: 0.3,
                            ),
                            decoration: InputDecoration(
                              hintText: '********',
                              hintStyle: AppTypography.bodySmall.copyWith(
                                fontSize: 14,
                                color: AppColors.textTertiary,
                                letterSpacing: 0.3,
                              ),
                              contentPadding: const EdgeInsets.all(16),
                              filled: false,
                              enabledBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(color: AppColors.border),
                              ),
                              focusedBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(
                                  color: AppColors.primary,
                                ),
                              ),
                              errorBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(color: AppColors.error),
                              ),
                              focusedErrorBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.zero,
                                borderSide: BorderSide(color: AppColors.error),
                              ),
                              suffixIcon: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                                child: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  size: 20,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Password is required';
                              }
                              if (value.length < 6) {
                                return 'At least 6 characters';
                              }
                              return null;
                            },
                          ),

                          // Error text
                          if (_error.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Text(
                              _error,
                              style: AppTypography.caption.copyWith(
                                fontSize: 12,
                                color: AppColors.error,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],

                          const SizedBox(height: 16),

                          // Submit button - border-2 primary p-4
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: OutlinedButton(
                              onPressed: authState.isLoading
                                  ? null
                                  : _handleEmailSubmit,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.textPrimary,
                                side: const BorderSide(
                                  color: AppColors.primary,
                                  width: 2,
                                ),
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.zero,
                                ),
                              ),
                              child: authState.isLoading
                                  ? SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: AppColors.primary,
                                      ),
                                    )
                                  : Text(
                                      _isSignUp ? '회원가입' : '로그인',
                                      style: AppTypography.bodySmall.copyWith(
                                        fontSize: 14,
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.w500,
                                        letterSpacing: 0.3,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Toggle sign up / sign in
                    Center(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _isSignUp = !_isSignUp;
                            _error = '';
                          });
                        },
                        child: RichText(
                          text: TextSpan(
                            style: AppTypography.bodySmall.copyWith(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                              letterSpacing: 0.3,
                            ),
                            children: [
                              TextSpan(
                                text: _isSignUp
                                    ? '이미 계정이 있으신가요? '
                                    : '계정이 없으신가요? ',
                              ),
                              TextSpan(
                                text: _isSignUp ? '로그인' : '회원가입',
                                style: const TextStyle(
                                  color: AppColors.textPrimary,
                                  decoration: TextDecoration.underline,
                                  decorationColor: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 48),
                  ],
                ),
              ),
            ),

            // Footer - terms text
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: Text(
                '로그인 시 이용약관 및 개인정보처리방침에 동의합니다',
                style: AppTypography.caption.copyWith(
                  fontSize: 10,
                  color: AppColors.textTertiary,
                  letterSpacing: 0.3,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleEmailSubmit() {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _error = '';
    });

    // Use Google sign-in as primary auth for now.
    // Email auth would need signInWithEmail/signUpWithEmail on AuthRepository.
    // Falling back to anonymous for form submission.
    ref.read(authProvider.notifier).signInAnonymously();
  }
}
