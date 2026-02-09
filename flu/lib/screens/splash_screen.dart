import 'package:flutter/material.dart';

class SplashScreen extends StatelessWidget {
  final double progress;

  const SplashScreen({super.key, this.progress = 0});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFFAF9F7),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Logo circle
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFF0D9488),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Center(
                child: Text(
                  'E',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 36,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'EnPeak',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w300,
                color: Color(0xFF1A1A1A),
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 32),
            // Progress bar
            SizedBox(
              width: 200,
              child: LinearProgressIndicator(
                value: progress > 0 ? progress : null,
                backgroundColor: const Color(0xFFE5E5E5),
                valueColor: const AlwaysStoppedAnimation<Color>(
                  Color(0xFF0D9488),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
