import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'package:flu/core/di/injection.dart';
import 'package:flu/core/theme/app_theme.dart';
import 'package:flu/firebase_options.dart';
import 'package:flu/features/navigation/presentation/pages/navigation_shell.dart';
import 'package:flu/features/talk/presentation/pages/talk_screen.dart';
import 'package:flu/features/daily/presentation/pages/daily_screen.dart';
import 'package:flu/features/create/presentation/pages/create_screen.dart';
import 'package:flu/features/feedback/presentation/pages/feedback_screen.dart';
import 'package:flu/features/login/presentation/pages/login_screen.dart';
import 'package:flu/features/cards/presentation/pages/cards_screen.dart';
import 'package:flu/features/my/presentation/pages/my_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await configureDependencies();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const ProviderScope(child: FluApp()));
}

class FluApp extends StatelessWidget {
  const FluApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flu',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: '/',
      onGenerateRoute: (settings) {
        Widget page;
        switch (settings.name) {
          case '/':
            page = const NavigationShell();
          case '/talk':
            page = const TalkScreen();
          case '/daily':
            page = const DailyScreen();
          case '/create':
            page = const CreateScreen();
          case '/feedback':
            page = const FeedbackScreen();
          case '/login':
            page = const LoginScreen();
          case '/cards':
            page = const CardsScreen();
          case '/my':
            page = const MyScreen();
          default:
            page = const NavigationShell();
        }

        // Root route uses no animation
        if (settings.name == '/') {
          return MaterialPageRoute(builder: (_) => page, settings: settings);
        }

        // All other routes: fade + slide up
        return PageRouteBuilder(
          settings: settings,
          pageBuilder: (context, animation, secondAnimation) => page,
          transitionDuration: const Duration(milliseconds: 300),
          reverseTransitionDuration: const Duration(milliseconds: 250),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final curvedAnimation = CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            );
            return FadeTransition(
              opacity: curvedAnimation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0, 0.05),
                  end: Offset.zero,
                ).animate(curvedAnimation),
                child: child,
              ),
            );
          },
        );
      },
    );
  }
}
