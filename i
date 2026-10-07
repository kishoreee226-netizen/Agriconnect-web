<!DOCTYPE html>
<html lang="te">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgriConnect - The Voice of Smart Farming</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
            background-color: #f8faf8;
            color: #333;
            line-height: 1.6;
        }
        /* Header */
        header {
            background-color: #1B5E20;
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        header h1 {
            font-size: 1.5rem;
        }
        header nav a {
            color: white;
            text-decoration: none;
            margin-left: 1.2rem;
            font-weight: 500;
        }
        /* Hero Section */
        .hero {
            background: linear-gradient(rgba(27, 94, 32, 0.85), rgba(27, 94, 32, 0.85)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80') center/cover;
            color: white;
            text-align: center;
            padding: 4rem 1.5rem;
        }
        .hero h2 {
            font-size: 2.2rem;
            margin-bottom: 1rem;
        }
        .hero p {
            font-size: 1.1rem;
            max-width: 650px;
            margin: 0 auto 1.5rem auto;
        }
        .btn-download {
            background-color: #FFD54F;
            color: #1B5E20;
            padding: 0.8rem 1.8rem;
            border-radius: 25px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        /* Features Section */
        .features {
            max-width: 1000px;
            margin: 3rem auto;
            padding: 0 1rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        .card {
            background: white;
            padding: 1.8rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            border-top: 4px solid #1B5E20;
            text-align: center;
        }
        .card h3 {
            color: #1B5E20;
            margin-bottom: 0.8rem;
        }
        /* Legal Section */
        .legal-section {
            background-color: #ffffff;
            max-width: 900px;
            margin: 2rem auto;
            padding: 2.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .legal-section h2 {
            color: #1B5E20;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 0.5rem;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
        /* Footer */
        footer {
            background-color: #1e261e;
            color: #ccc;
            text-align: center;
            padding: 2rem 1rem;
            margin-top: 3rem;
            font-size: 0.9rem;
        }
        footer a {
            color: #FFD54F;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <header>
        <h1>🌱 AgriConnect</h1>
        <nav>
            <a href="#features">ఫీచర్లు</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms</a>
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <h2>రైతు, కూలీ, వ్యాపారుల వారధి</h2>
        <p>వ్యవసాయ కూలీల లభ్యత, యంత్రాల అద్దె, మరియు ప్రత్యక్ష మార్కెట్ ధరలు – అన్నీ ఒకే వేదికపై!</p>
        <a href="#download" class="btn-download">📲 Get App on Google Play</a>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="card">
            <h3>🌾 రైతు వేదిక</h3>
            <p>వరి, మిర్చి, పత్తి పంట అమ్మకం ప్రకటనలు సులభంగా పోస్ట్ చేయండి. సమీపంలోని కూలీలను వెతకండి.</p>
        </div>
        <div class="card">
            <h3>🚜 యంత్రాల అద్దె</h3>
            <p>ట్రాక్టర్లు, వరి కోత యంత్రాలు, డ్రోన్ స్ప్రేయింగ్ ఆపరేటర్ల ఫోన్ నంబర్లు క్షణాల్లో పొందండి.</p>
        </div>
        <div class="card">
            <h3>📈 మార్కెట్ యార్డ్ ధరలు</h3>
            <p>వరంగల్ ఏనుమాముల యార్డ్ మరియు స్థానిక మార్కెట్ రోజువారీ కనిష్ట, గరిష్ట ధరల లైవ్ అప్‌డేట్స్.</p>
        </div>
    </section>

    <!-- Legal Compliance Sections (For Play Store Review) -->
    <main class="legal-section">
        <!-- Privacy Policy -->
        <article id="privacy">
            <h2>Privacy Policy</h2>
            <p><strong>Effective Date:</strong> October 4, 2026</p>
            <p style="margin-top: 8px;">
                Welcome to <strong>AgriConnect</strong>. AgriConnect is operated by <strong>AgriConnect Technologies</strong> (UDYAM: UDYAM-TS-31-0063048). We respect your privacy and are committed to protecting your personal information.
            </p>
            <h4 style="margin-top: 12px;">1. Information We Collect</h4>
            <p>We collect mobile numbers for OTP authentication, user roles (Farmer/Worker/Trader), and precise location data solely to connect you with nearby farm laborers, machinery, and market rates.</p>
            
            <h4 style="margin-top: 12px;">2. Permissions Used</h4>
            <p>The app accesses Location (hyperlocal services), Microphone (optional voice assistance), and Storage/Camera (crop photo uploads).</p>

            <h4 style="margin-top: 12px;">3. Data Deletion</h4>
            <p>You can request complete deletion of your account and personal data at any time by emailing us at: <strong>agriconnect.office@gmail.com</strong>.</p>
        </article>

        <hr style="margin: 2rem 0; border: none; border-top: 1px dashed #ccc;">

        <!-- Terms and Conditions -->
        <article id="terms">
            <h2>Terms and Conditions</h2>
            <p><strong>Effective Date:</strong> October 4, 2026</p>
            <p style="margin-top: 8px;">
                AgriConnect operates strictly as an intermediary/aggregator platform connecting farmers with laborers, machinery operators, and traders. 
            </p>
            <h4 style="margin-top: 12px;">Platform Liability</h4>
            <p>AgriConnect does not directly employ workers or guarantee commodity transaction prices. All wage negotiations and commercial transactions occur directly between the users.</p>
            
            <h4 style="margin-top: 12px;">Jurisdiction</h4>
            <p>Any disputes arising under these terms are subject to the exclusive jurisdiction of the courts located in Warangal / Hanamkonda, Telangana, India.</p>
        </article>
    </main>

    <!-- Footer -->
    <footer>
        <p><strong>AgriConnect Technologies</strong> | UDYAM-TS-31-0063048</p>
        <p>Hanamkonda / Warangal, Telangana, India</p>
        <p>Contact: <a href="mailto:agriconnect.office@gmail.com">agriconnect.office@gmail.com</a></p>
        <p style="margin-top: 10px; font-size: 0.8rem; color: #888;">&copy; 2026 AgriConnect. All Rights Reserved.</p>
    </footer>

</body>
</html>
