import 'package:flutter_test/flutter_test.dart';
import 'package:flu/app.dart';

void main() {
  testWidgets('App renders', (WidgetTester tester) async {
    await tester.pumpWidget(const EnPeakApp());
    // WebView shell should attempt to render
    expect(find.byType(EnPeakApp), findsOneWidget);
  });
}
