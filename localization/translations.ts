export const translations = {
  en: {
    language: "Language",
    settings: "Settings",
    chats: "Chats",
    friends: "Friends",
    rooms: "Rooms",
    search: "Search",
    profile: "Profile",
    common: {
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",


    },
    chooseLocationScreen: {
      title: "Choose Your Location",
      subtitle:
        "You must choose at least the country, and you can optionally choose the city.",
      countryLabel: "Country *",
      cityLabel: "City (optional)",
      selectCountry: "Select country",
      selectCity: "Select city",
      selectCountryFirst: "Select country first",
      saveAndContinue: "Save and Continue",
      continueBtn: "Continue",

      errors: {
        countryRequired: "Please choose a country first",
        countryMinimum: "You must choose at least the country",
        saveFailed: "Failed to save location",
        continueFailed: "Failed to continue",
      },
    },
    welcomeScreen: {
      counterText: "46,023 people found their community",
      googleLogin: "Sign in with Google",
      phoneLogin: "Sign in with phone",
      or: "Or",
      privacyPrefix: "By tapping to sign in, you confirm that you have read and agree to the",
      userAgreement: "User Agreement",
      and: "and",
      privacyPolicy: "Privacy Policy",

      alerts: {
        noticeTitle: "Notice",
        acceptPrivacyFirst: "You must agree to the User Agreement and Privacy Policy first",
        comingSoonTitle: "Coming soon",
        tiktokSoon: "You can add TikTok sign-in later",
        googleLoginFailed: "Google sign-in failed",
        playServicesUnavailable: "Google Play Services are not available on this device",
        googleConfigError:
          "There is an error in Google Sign-In setup. Check SHA-1, webClientId, and google-services.json",
        openPrivacyFailed: "Could not open Privacy Policy",
        openTermsFailed: "Could not open User Agreement",
      },
    },
    changePassword: {
      title: "Change Password",
      currentPasswordLabel: "Current Password",
      currentPasswordPlaceholder: "••••••••",
      newPasswordLabel: "New Password",
      newPasswordPlaceholder: "At least 6 characters",
      confirmPasswordLabel: "Confirm New Password",
      confirmPasswordPlaceholder: "••••••••",

      alerts: {
        confirmMismatch: "Password confirmation does not match",
        success: "Password changed successfully",
      },

      note: "Tip: Use a strong password and do not share it with anyone.",
    },


    about: {
      headerTitle: "About App",
      headerSub: "General information about {{appName}}",
      versionLabel: "Version {{version}}",

      descPrefix: "{{appName}} is a modern social app designed to provide a communication experience that is",
      simple: "simple",
      and: "and",
      safe: "secure",
      fast: "fast",
      descSuffix: "for users, with continuous improvements in performance, privacy, and user experience.",

      features: {
        privacy: {
          title: "Privacy",
          sub: "More control over your data",
        },
        performance: {
          title: "Performance",
          sub: "Smooth UI and fast response",
        },
        community: {
          title: "Community",
          sub: "Rooms, chat, and interaction",
        },
        experience: {
          title: "Experience",
          sub: "Modern and comfortable design",
        },
      },

      info: {
        platform: "Platform",
        service: "Service",
        security: "Security",
      },

      footer: "Thank you for using {{appName}}. We are always working to improve the app.",
    },
    verifyResetCodeScreen: {
      title: "Enter Verification Code",
      subtitle: "Enter the OTP sent to your email address",
      otpPH: "Enter code",
      verifyBtn: "Verify Code",
      verifyingBtn: "Verifying...",
      resendBtn: "Resend Code",
      resendingBtn: "Resending...",
      loginBack: "Back to Login",
      missingEmail: "Email not found. Please request the code first",
      otpExpired: "The code has expired. Please request a new code",

      codeValidity: "Code validity",
      resendLabel: "Resend",
      availableNow: "Available now",
      secondsShort: "{{seconds}} sec",
      resendIn: "Resend in {{seconds}} seconds",

      toasts: {
        expiredTitle: "Expired",
        checkOtp: "Please check the verification code",
        verifiedTitle: "Verified",
        verifiedMessage: "You can now set a new password",
        verifyFailedTitle: "Verification failed",
        waitTitle: "Please wait",
        resendAfter: "You can resend after {{seconds}} seconds",
        sentTitle: "Sent",
        resentMessage: "Verification code has been resent",
      },

      errors: {
        otpRequired: "Please enter the verification code",
        otpInvalid: "Verification code must be digits only, 4 to 8 characters",
        missingEmail: "Email not found. Please request the code first",
        otpExpired: "The code has expired. Please request a new code",
        verifyFailed: "The verification code is invalid or expired",
        resendFailed: "Could not resend the code",
      },
    },
    resetPasswordScreen: {
      title: "Set a New Password",
      subtitle: "Enter the new password and confirm it to continue",
      passwordPH: "New Password",
      confirmPasswordPH: "Confirm New Password",
      saveBtn: "Save Password",
      savingBtn: "Saving...",
      backLogin: "Back to Login",

      toasts: {
        checkPassword: "Please check the new password",
        resetSuccess: "Password changed successfully",
        operationFailedTitle: "Operation failed",
        requestError: "An error occurred while changing the password",
      },

      errors: {
        missingData:
          "Reset data is incomplete. Please request the verification code first",
        passwordRequired: "Please enter the new password",
        passwordNoSpaces: "Password must not contain spaces",
        passwordInvalid:
          "Invalid password. Allowed: Arabic/English letters, numbers, selected symbols, and length from 6 to 64",
        confirmPasswordRequired: "Please confirm the password",
        passwordsMismatch: "Passwords do not match",
        resetFailed: "Could not change the password, please try again",
      },
    },
    helpSupport: {
      headerTitle: "Help & Support",
      headerSub: "Technical support, FAQs, and issue reporting",
      pill: "Support",
      emailSubject: "Bimo Support",
      fallbackSubject: "Support",

      tips: {
        updateApp:
          "Before contacting support, try updating the app, reopening it, and checking your internet connection.",
        passwordWarning:
          "Do not share your password or verification code with anyone, not even support.",
      },

      items: {
        email: {
          title: "Contact by Email",
          subtitle: "Send us the issue and we will reply as soon as possible",
        },
        chat: {
          title: "Chat with Support",
          subtitle: "Direct conversation with the support team (if enabled)",
        },
        faq: {
          title: "Frequently Asked Questions",
          subtitle: "Quick answers to the most common questions",
        },
        report: {
          title: "Report a User or Content",
          subtitle: "Report abuse or a policy violation",
        },
        guidelines: {
          title: "Usage Guidelines",
          subtitle: "Tips for a safer and more respectful experience",
        },
        safety: {
          title: "Safety & Privacy",
          subtitle: "Tips to protect your data and account",
        },
      },

      emailTemplate: {
        greeting: "Hello support team,",
        problemIntro: "I am facing the following issue:",
        problemDescription: "- Problem description:",
        problemSteps: "- Steps to reproduce:",
        problemAttachment: "- Screenshot/details if available:",
        deviceInfoTitle: "Device information (optional):",
        deviceSystem: "- System:",
        deviceVersion: "- Version:",
        thanks: "Thank you.",
      },

      footer:
        "We are committed to privacy. We may only request non-sensitive diagnostic information to improve the service.",
    },
    languageSettings: {
      headerTitle: "Language",
      headerSub: "Choose the app language that suits you",
      info: "The selected language will be applied to most parts of the app immediately or after reopening some screens.",
      footer: "You can change the language at any time from settings.",
      languages: {
        ar: "Arabic",
        en: "English",
      },
    },

    terms: {
      headerTitle: "Terms & Conditions",
      headerSub: "Please read carefully before using the app",
      pill: "Terms",

      intro: {
        title: "Introduction",
        body: "This app is intended for Islamic matchmaking in accordance with ethical and religious guidelines, and aims to provide a respectful environment that helps users communicate seriously and with clear intentions. By using the app, you acknowledge that you have read, understood, and fully agreed to these terms.",
        note: "If you do not agree with any provision, please stop using the app immediately.",
      },

      sections: {
        eligibility: {
          title: "1) Eligibility and Proper Use",
          items: {
            legal: "The user must be legally eligible to use the app according to the laws of their country.",
            serious: "The user must use the app for serious matchmaking only and in a respectful manner.",
            prohibited: "Using the app for immoral purposes, entertainment, blackmail, or abuse is prohibited.",
            impersonation: "Impersonating others or providing misleading information is prohibited.",
          },
        },

        islamicGuidelines: {
          title: "2) Islamic Interaction Guidelines",
          items: {
            values: "The user must respect Islamic values and public morals during conversations.",
            indecent: "Exchanging indecent or religiously inappropriate content is prohibited (images/videos/text/links).",
            marriage: "Communication should preferably be with the intention of marriage and with transparency, while avoiding non-serious relationships.",
            personalData: "Any communication outside the app or sharing of personal information is entirely at the user's own responsibility.",
          },
        },

        prohibitedContent: {
          title: "3) Prohibited Content and Policies",
          items: {
            abuse: "Posting or sending threats, hate, harassment, blackmail, defamation, or insults is prohibited.",
            links: "Posting malicious links, hacking attempts, or requesting sensitive data is prohibited.",
            sales: "Selling or buying unauthorized services/products through the platform is prohibited.",
            performance: "Using the app in a way that affects or disrupts service performance is prohibited.",
          },
        },

        privacyData: {
          title: "4) Privacy and Data",
          items: {
            operational: "We may collect basic operational data to improve the service (such as crashes and performance) in accordance with the Privacy Policy.",
            account: "You are responsible for protecting your account, password, and any activity carried out through your account.",
            sensitive: "We do not recommend sharing sensitive information (address, bank accounts, passwords, verification codes).",
          },
        },

        disclaimer: {
          title: "5) Disclaimer (Very Important)",
          warning: "The app only provides a communication platform, and we are not responsible for user behavior, the accuracy of their information, or any agreements or communications made between them inside or outside the app.",
          items: {
            identity: "We do not guarantee users' identities, intentions, or the truthfulness of their information.",
            loss: "Any harm, loss, or dispute resulting from communication between users is their personal responsibility.",
            caution: "We always advise caution, verification, not sending money, and avoiding sharing private information.",
            report: "If you suspect abusive behavior, use the report/block feature immediately.",
          },
        },

        reporting: {
          title: "6) Reporting, Blocking, and Moderation",
          items: {
            actions: "We reserve the right to take action regarding reports (warning/restriction/ban) at our discretion.",
            disable: "An account may be disabled in case of repeated violations or harm to the community.",
            verify: "We may request additional information for verification when impersonation or misuse is suspected.",
          },
        },

        updates: {
          title: "7) Modifications and Service Termination",
          items: {
            terms: "We may update these terms from time to time, and your continued use constitutes acceptance of the update.",
            service: "We may suspend, modify, or terminate the service or some features without prior notice when necessary.",
          },
        },
      },

      footer: "By using the app, you agree to all of the terms stated above.",
    },
    blocked: {
      headerTitle: "Blocked Accounts",
      count: "Count: {{count}}",
      searchPlaceholder: "Search for an account...",
      swipeAction: "Unblock",
      unblockButton: "Unblock",

      emptyTitle: "No blocked accounts",
      emptyText: "When you block any account, it will appear here and you can unblock it.",

      modal: {
        title: "Do you want to unblock?",
        hint: "The user will be able to interact with you again.",
        confirm: "Yes, unblock",
      },
    },


    privacy: {
      headerTitle: "Privacy Policy",
      headerSub: "How we collect, use, and protect data",
      pill: "Privacy",

      intro: {
        title: "Introduction",
        body: "We respect user privacy and are committed to protecting personal data. This policy explains what data we may collect, how we use it, when it may be shared, and what rights you have regarding your data.",
        note: "By using the app, you agree to this policy. If you do not agree, please stop using the app.",
      },

      sections: {
        dataCollected: {
          title: "1) Data We May Collect",
          items: {
            account: "Account data: such as name, username, identifier, and profile photo (if you add one).",
            content: "Usage content: such as messages, posts, and comments you create inside the app.",
            technical: "Technical data: such as device type, operating system, app errors, and performance data to improve the service.",
            usage: "Usage data: such as pages you visit inside the app and interaction duration (for improvement and analytics purposes).",
          },
        },

        dataUsage: {
          title: "2) How We Use Data",
          items: {
            service: "To operate the service and provide core features (account creation, content display, messaging, etc.).",
            improvement: "To improve user experience, performance, and fix issues.",
            safety: "To reduce abuse, fight spam, and enhance security.",
            communication: "To contact you بشأن important updates or policy changes when needed.",
          },
        },

        dataSharing: {
          title: "3) Sharing Data with Other Parties",
          warning: "We do not sell your personal data. Limited data may only be shared when necessary to operate the service or comply with the law.",
          items: {
            providers: "Service providers: we may use hosting, analytics, or notification services, with their commitment to protect data.",
            legal: "Legal compliance: we may share data upon an official request from a competent authority or to comply with the law.",
            rights: "Protection of rights: when fraud, abuse, or threats to user safety are suspected.",
          },
        },

        security: {
          title: "4) Security and Data Protection",
          items: {
            measures: "We use reasonable security measures to protect data from unauthorized access.",
            noGuarantee: "No method is 100% secure; therefore, we cannot guarantee absolute protection against all risks.",
            userResponsibility: "You are responsible for protecting your account (passwords/verification codes) and not sharing them.",
          },
        },

        retention: {
          title: "5) Data Retention",
          items: {
            duration: "We retain data for as long as necessary to provide and improve the service and comply with legal requirements.",
            logs: "Some technical logs may be kept for a limited period for security and diagnostic reasons.",
          },
        },

        rights: {
          title: "6) Your Rights",
          items: {
            edit: "You may update your profile information from within the app.",
            delete: "You may request deletion of your account/data according to the deletion method available in the app (if provided).",
            report: "You can report abusive content or violating users through reporting/blocking tools.",
          },
        },

        userContent: {
          title: "7) User Content and Communication Between Users (Dating App)",
          items: {
            responsibility: "The app provides a communication platform, and any sharing of personal information (phone, address, private photos) is your responsibility.",
            sensitive: "We advise against sharing sensitive data or sending money to any user.",
            noLiability: "We are not responsible for user behavior, the accuracy of their information, or any agreements made between them inside or outside the app.",
          },
        },

        updates: {
          title: "8) Privacy Policy Updates",
          items: {
            change: "We may update this policy from time to time. Your continued use of the app after updates means you accept them.",
            notice: "We will try to show an in-app notice when there are material updates.",
          },
        },
      },

      footer: "If you have any privacy questions, you can contact app support from within settings (if available).",
    },
    forgotPasswordScreen: {
      title: "Forgot Password",
      subtitle: "Enter your email to receive the verification code",
      inputPH: "Email address",
      sendBtn: "Send Code",
      sendingBtn: "Sending...",
      backBtn: "Back to Login",

      toasts: {
        checkEmail: "Please check your email address",
        sentTitle: "Sent",
        sentMessage: "If the email exists, you will receive the verification code",
        sendFailedTitle: "Sending failed",
        requestError: "An error occurred while sending the request",
      },

      errors: {
        emailRequired: "Please enter your email address",
        emailInvalid: "Please enter a valid email address",
        sendFailed: "Could not send the verification code, please try again",
      },
    },
    changeEmail: {
  title: "Change Email",
  currentEmailLabel: "Current Email",
  newEmailLabel: "New Email",
  newEmailPlaceholder: "example@email.com",
  unavailable: "Unavailable",
  saveButton: "Save New Email",

  note: "Make sure to enter a valid and accessible email address, as it may be used later for account recovery or verification.",

  errors: {
    required: "Please enter your email address",
    invalid: "Please enter a valid email address",
    sameAsCurrent: "This is the same as your current email",
  },

  toasts: {
    success: "Email changed successfully",
    failed: "Failed to change email",
    unexpected: "An unexpected error occurred",
  },
},


    registerScreen: {
      title: "Create Account",
      subtitle: "Join the conversation",
      usernamePH: "Username",
      passwordPH: "Password",
      confirmPH: "Confirm Password",
      captchaPH: "Captcha: {{a}} + {{b}} = ?",
      refreshCaptcha: "Refresh Captcha",
      registerBtn: "Create Account",
      loadingBtn: "Creating...",
      loginLine: "Already have an account? ",
      loginLink: "Login",

      toasts: {
        checkInputs: "Please check your input data",
        registerSuccess: "Account created successfully",
        registerFailedTitle: "Registration failed",
      },

      errors: {
        usernameRequired: "Please enter your username",
        usernameNoSpaces: "Username must not contain spaces",
        usernameInvalid:
          "Invalid username. Allowed: Arabic/English letters, numbers, symbols (. _ -), and length from 3 to 64",
        passwordRequired: "Please enter your password",
        passwordNoSpaces: "Password must not contain spaces",
        passwordInvalid:
          "Invalid password. Allowed: Arabic/English letters, numbers, selected symbols, and length from 6 to 64",
        confirmRequired: "Please confirm your password",
        passwordsMismatch: "Passwords do not match",
        captchaRequired: "Please enter the captcha result",
        captchaInvalid: "Incorrect captcha",
        registerFailed: "Could not create account",
        unexpected: "An unexpected error occurred",
      },
    },
    loginScreen: {
      title: "Welcome Back",
      subtitle: "Sign in to continue",
      usernamePH: "Username",
      passwordPH: "Password",
      loginBtn: "Login",
      loadingBtn: "Logging in...",
      forgotPassword: "Forgot password?",
      registerLine: "Don't have an account? ",
      registerLink: "Create Account",

      toasts: {
        checkInputs: "Please check your input data",
        loginSuccess: "Logged in successfully",
        loginFailed: "Login failed",
      },

      errors: {
        usernameRequired: "Please enter your username",
        usernameNoSpaces: "Username must not contain spaces",
        usernameInvalid:
          "Invalid username. Allowed: Arabic/English letters, numbers, . _ - and length from 3 to 64",
        passwordRequired: "Please enter your password",
        passwordNoSpaces: "Password must not contain spaces",
        passwordInvalid:
          "Invalid password. Allowed: Arabic/English letters, numbers, selected symbols, and length from 6 to 64",
        invalidCredentials: "Invalid credentials",
        unexpected: "An unexpected error occurred",
      },
    },


    settingsScreen: {
      header: "Settings",

      account: "Account",
      editProfile: "Edit Profile",
      verifyAccount: "Verify Account",
      profilePhotoCover: "Profile Photo & Cover",
      changePassword: "Change Password",
      privacy: "Privacy",
      onlineStatus: "Online Status",
      readReceipts: "Read Receipts",
      locationSharing: "Location Sharing",
      blockedAccounts: "Blocked Accounts",
      changeEmail: "Change Email",
      notifications: "Notifications",
      notificationToggle: "Notifications",
      notificationSounds: "Notification Sounds",

      appearance: "Appearance",
      darkMode: "Dark Mode",
      theme: "Colors & Theme",
      fontSize: "Font Size",

      media: "Media",
      autoPlayVideos: "Auto Play Videos",
      dataUsage: "Data Usage",

      security: "Security",
      biometricLock: "Biometric Lock",
      twoFactor: "Two-Factor Authentication",
      loginAlerts: "Login Alerts",

      app: "App",
      language: "Language",
      aboutApp: "About App",
      helpSupport: "Help & Support",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms & Conditions",

      logout: "Logout",
      version: "Bimo v1.0.0",
    },
    tweetsScreen: {
      followingTab: "Following",
      forYouTab: "For You",
      delete: "Delete",
      follow: "Follow",
      following: "Following",
      unfollow: "Unfollow",
      block: "Block",
      report: "Report",
    }
  },

  ar: {
    language: "اللغة",
    settings: "الإعدادات",
    chats: "الدردشات",
    friends: "الأصدقاء",
    rooms: "الغرف",
    search: "بحث",
    profile: "الملف الشخصي",
    common: {
      error: "خطأ",
      success: "تم بنجاح",
      cancel: "إلغاء",
      save: "حفظ",


    },
    welcomeScreen: {
      counterText: "46,023 شخص وجدوا مجتمعهم",
      googleLogin: "تسجيل الدخول إلى Google",
      phoneLogin: "تسجيل الدخول باستخدام الهاتف",
      or: "Or",
      privacyPrefix: "يعني النقر لتسجيل الدخول أنك قرأت ووافقت",
      userAgreement: "اتفاقية المستخدم",
      and: "و",
      privacyPolicy: "اتفاقية الخصوصية",

      alerts: {
        noticeTitle: "تنبيه",
        acceptPrivacyFirst: "يجب الموافقة على اتفاقية المستخدم وسياسة الخصوصية أولًا",
        comingSoonTitle: "قريبًا",
        tiktokSoon: "يمكنك ربط تسجيل TikTok لاحقًا",
        googleLoginFailed: "فشل تسجيل الدخول بواسطة Google",
        playServicesUnavailable: "خدمات Google Play غير متاحة على هذا الجهاز",
        googleConfigError:
          "يوجد خطأ في إعداد Google Sign-In. تأكد من SHA-1 و webClientId و google-services.json",
        openPrivacyFailed: "تعذر فتح سياسة الخصوصية",
        openTermsFailed: "تعذر فتح اتفاقية المستخدم",
      },
    },
    helpSupport: {
      headerTitle: "المساعدة والدعم",
      headerSub: "الدعم الفني، الأسئلة الشائعة، والإبلاغ عن المشاكل",
      pill: "الدعم",
      emailSubject: "دعم Bimo",
      fallbackSubject: "الدعم",

      tips: {
        updateApp:
          "قبل التواصل، جرّب تحديث التطبيق وإعادة فتحه، وتأكد من اتصال الإنترنت.",
        passwordWarning:
          "لا تشارك كلمة المرور أو رمز التحقق مع أي شخص، حتى الدعم.",
      },

      items: {
        email: {
          title: "تواصل عبر البريد الإلكتروني",
          subtitle: "ارسل لنا المشكلة وسيتم الرد في أقرب وقت",
        },
        chat: {
          title: "الدردشة مع الدعم",
          subtitle: "محادثة مباشرة مع فريق الدعم (إن كانت مفعلة)",
        },
        faq: {
          title: "الأسئلة الشائعة",
          subtitle: "إجابات سريعة لأكثر الأسئلة تكرارًا",
        },
        report: {
          title: "الإبلاغ عن مستخدم أو محتوى",
          subtitle: "الإبلاغ عن إساءة أو مخالفة سياسة الاستخدام",
        },
        guidelines: {
          title: "إرشادات الاستخدام",
          subtitle: "نصائح لتجربة أكثر أمانًا واحترامًا",
        },
        safety: {
          title: "السلامة والخصوصية",
          subtitle: "نصائح لحماية بياناتك وحسابك",
        },
      },

      emailTemplate: {
        greeting: "مرحبًا فريق الدعم،",
        problemIntro: "أواجه المشكلة التالية:",
        problemDescription: "- وصف المشكلة:",
        problemSteps: "- خطوات إعادة المشكلة:",
        problemAttachment: "- لقطة/تفاصيل إن وجدت:",
        deviceInfoTitle: "معلومات الجهاز (اختياري):",
        deviceSystem: "- النظام:",
        deviceVersion: "- الإصدار:",
        thanks: "شكرًا لكم.",
      },

      footer:
        "نلتزم بالخصوصية. قد نطلب معلومات تشخيصية غير حساسة فقط لتحسين الخدمة.",
    },

    privacy: {
      headerTitle: "سياسة الخصوصية",
      headerSub: "كيف نجمع البيانات ونستخدمها ونحميها",
      pill: "الخصوصية",

      intro: {
        title: "مقدمة",
        body: "نحن نحترم خصوصية المستخدمين ونلتزم بحماية البيانات الشخصية. توضح هذه السياسة نوع البيانات التي قد نجمعها، وكيف نستخدمها، ومتى يمكن مشاركتها، وما هي حقوقك المتعلقة ببياناتك.",
        note: "باستخدامك للتطبيق، فإنك توافق على هذه السياسة. إذا لم توافق، يرجى التوقف عن استخدام التطبيق.",
      },

      sections: {
        dataCollected: {
          title: "1) البيانات التي قد نجمعها",
          items: {
            account: "بيانات الحساب: مثل الاسم/اسم المستخدم/المعرّف والصورة الشخصية (إن قمت بإضافتها).",
            content: "محتوى الاستخدام: مثل الرسائل/المنشورات/التعليقات التي تنشئها داخل التطبيق.",
            technical: "بيانات تقنية: مثل نوع الجهاز، نظام التشغيل، أخطاء التطبيق، وبيانات الأداء لتحسين الخدمة.",
            usage: "بيانات الاستخدام: مثل الصفحات التي تزورها داخل التطبيق ومدة التفاعل (لأغراض التحسين والتحليلات).",
          },
        },

        dataUsage: {
          title: "2) كيف نستخدم البيانات",
          items: {
            service: "تشغيل الخدمة وتقديم المزايا الأساسية (إنشاء الحساب، عرض المحتوى، الرسائل...).",
            improvement: "تحسين تجربة المستخدم، والأداء، وإصلاح الأعطال.",
            safety: "الحد من إساءة الاستخدام، ومكافحة السبام، وتعزيز الأمان.",
            communication: "التواصل معك بخصوص تحديثات مهمة أو تغييرات في السياسات عند الحاجة.",
          },
        },

        dataSharing: {
          title: "3) مشاركة البيانات مع أطراف أخرى",
          warning: "نحن لا نبيع بياناتك الشخصية. قد تتم مشاركة بيانات محدودة فقط عند الضرورة لتشغيل الخدمة أو الالتزام بالقانون.",
          items: {
            providers: "مزودو الخدمة: قد نستخدم خدمات استضافة/تحليلات/إرسال إشعارات، مع التزامهم بحماية البيانات.",
            legal: "الالتزام القانوني: قد نشارك بيانات عند وجود طلب رسمي من جهة مختصة أو للامتثال للقانون.",
            rights: "حماية الحقوق: عند الاشتباه بالاحتيال أو إساءة استخدام أو تهديد أمن المستخدمين.",
          },
        },

        security: {
          title: "4) الأمان وحماية البيانات",
          items: {
            measures: "نستخدم إجراءات أمنية معقولة لحماية البيانات من الوصول غير المصرح به.",
            noGuarantee: "لا توجد وسيلة آمنة 100%؛ لذلك لا يمكننا ضمان حماية مطلقة ضد جميع المخاطر.",
            userResponsibility: "أنت مسؤول عن حماية حسابك (كلمة المرور/رموز التحقق) وعدم مشاركتها.",
          },
        },

        retention: {
          title: "5) الاحتفاظ بالبيانات",
          items: {
            duration: "نحتفظ بالبيانات للمدة اللازمة لتقديم الخدمة وتحسينها والامتثال للمتطلبات القانونية.",
            logs: "قد يتم الاحتفاظ ببعض السجلات التقنية لفترة محدودة لأسباب أمنية وتشخيصية.",
          },
        },

        rights: {
          title: "6) حقوقك",
          items: {
            edit: "يحق لك تعديل بيانات ملفك الشخصي من داخل التطبيق.",
            delete: "يحق لك طلب حذف حسابك/بياناتك حسب آلية الحذف المتاحة في التطبيق (إن توفرت).",
            report: "يمكنك الإبلاغ عن أي محتوى مسيء أو مستخدم مخالف عبر أدوات الإبلاغ/الحظر.",
          },
        },

        userContent: {
          title: "7) المحتوى والتواصل بين المستخدمين (تطبيق تعارف)",
          items: {
            responsibility: "التطبيق يوفّر منصة تواصل، وأي مشاركة لمعلومات شخصية (هاتف/عنوان/صور خاصة) تكون على مسؤوليتك.",
            sensitive: "ننصح بعدم مشاركة بيانات حساسة أو إرسال أموال لأي مستخدم.",
            noLiability: "لا نتحمل مسؤولية تصرفات المستخدمين أو صحة بياناتهم أو أي اتفاقات تتم بينهم داخل التطبيق أو خارجه.",
          },
        },

        updates: {
          title: "8) تحديثات سياسة الخصوصية",
          items: {
            change: "قد نقوم بتحديث هذه السياسة من وقت لآخر. استمرارك في استخدام التطبيق بعد التحديث يعني موافقتك.",
            notice: "سنحاول إظهار إشعار داخل التطبيق عند وجود تحديثات جوهرية.",
          },
        },
      },

      footer: "إذا كان لديك أي استفسار حول الخصوصية، يمكنك التواصل مع دعم التطبيق من داخل الإعدادات (إن وُجد).",
    },
    blocked: {
      headerTitle: "الحسابات المحظورة",
      count: "العدد: {{count}}",
      searchPlaceholder: "ابحث عن حساب...",
      swipeAction: "إلغاء",
      unblockButton: "إلغاء الحظر",

      emptyTitle: "لا توجد حسابات محظورة",
      emptyText: "عند حظر أي حساب سيظهر هنا ويمكنك إلغاء الحظر.",

      modal: {
        title: "هل تريد إلغاء الحظر؟",
        hint: "سيصبح المستخدم قادرًا على التفاعل معك مجددًا.",
        confirm: "نعم، إلغاء",
      },
    },


    terms: {
      headerTitle: "الشروط والأحكام",
      headerSub: "يرجى القراءة بعناية قبل استخدام التطبيق",
      pill: "الشروط",

      intro: {
        title: "مقدمة",
        body: "هذا التطبيق مخصص للتعارف الإسلامي وفق الضوابط الشرعية والأخلاقية، ويهدف إلى توفير بيئة محترمة تساعد المستخدمين على التواصل بشكل جاد وبنية واضحة. باستخدامك للتطبيق فأنت تقرّ بأنك قرأت هذه الشروط وفهمتها ووافقت عليها كاملة.",
        note: "في حال عدم موافقتك على أي بند، يرجى التوقف عن استخدام التطبيق فورًا.",
      },

      sections: {
        eligibility: {
          title: "1) الأهلية وحسن الاستخدام",
          items: {
            legal: "يلزم أن يكون المستخدم مؤهلًا قانونيًا لاستخدام التطبيق وفق قوانين دولته.",
            serious: "يلتزم المستخدم باستخدام التطبيق للتعارف الجاد فقط وبأسلوب محترم.",
            prohibited: "يُحظر استخدام التطبيق لأي أغراض غير أخلاقية أو للتسلية أو الابتزاز أو الإساءة.",
            impersonation: "يُحظر انتحال شخصية الغير أو تقديم معلومات مضللة.",
          },
        },

        islamicGuidelines: {
          title: "2) ضوابط التعرّف الإسلامي",
          items: {
            values: "يلتزم المستخدم باحترام القيم الإسلامية والآداب العامة أثناء المحادثة.",
            indecent: "يُمنع تبادل محتوى خادش للحياء أو مخالف للشرع (صور/فيديو/نصوص/روابط).",
            marriage: "يُفضّل أن يكون التواصل بنية الزواج وبشفافية، مع تجنب العلاقات غير الجادة.",
            personalData: "أي تواصل خارج التطبيق أو مشاركة بيانات شخصية يتم على مسؤولية المستخدم بالكامل.",
          },
        },

        prohibitedContent: {
          title: "3) المحتوى الممنوع والسياسات",
          items: {
            abuse: "يُمنع نشر أو إرسال: تهديدات، كراهية، تحرش، ابتزاز، تشهير، أو سباب.",
            links: "يُمنع نشر الروابط الضارة أو محاولات الاختراق أو طلب البيانات الحساسة.",
            sales: "يُمنع بيع أو شراء خدمات/منتجات غير مصرّح بها عبر المنصة.",
            performance: "يُمنع استخدام التطبيق بطريقة تؤثر على أداء الخدمة أو تعطلها.",
          },
        },

        privacyData: {
          title: "4) الخصوصية والبيانات",
          items: {
            operational: "قد نجمع بيانات تشغيلية أساسية لتحسين الخدمة (مثل الأعطال والأداء) وفق سياسة الخصوصية.",
            account: "أنت مسؤول عن حماية حسابك وكلمة المرور وأي نشاط يتم عبر حسابك.",
            sensitive: "لا ننصح بمشاركة معلومات حساسة (العنوان، الحسابات البنكية، كلمات المرور، رموز التحقق).",
          },
        },

        disclaimer: {
          title: "5) إخلاء المسؤولية (مهم جدًا)",
          warning: "التطبيق يوفّر منصة تواصل فقط، ولا نتحمل مسؤولية تصرفات المستخدمين أو صحة معلوماتهم أو أي اتفاقات أو تواصل يتم بينهم داخل التطبيق أو خارجه.",
          items: {
            identity: "لا نضمن هوية المستخدمين أو نواياهم أو صدق بياناتهم.",
            loss: "أي ضرر أو خسارة أو نزاع ينتج عن التواصل بين المستخدمين يقع على مسؤوليتهم الشخصية.",
            caution: "ننصح دائمًا بالتريث، والتحقق، وعدم إرسال أموال، وتجنب مشاركة معلومات خاصة.",
            report: "في حال الاشتباه بسلوك مسيء، استخدم خاصية الإبلاغ/الحظر فورًا.",
          },
        },

        reporting: {
          title: "6) الإبلاغ والحظر والإشراف",
          items: {
            actions: "نحتفظ بحقنا في اتخاذ إجراءات عند البلاغات (تحذير/تقييد/حظر) حسب تقديرنا.",
            disable: "قد يتم تعطيل الحساب عند تكرار المخالفات أو الإضرار بالمجتمع.",
            verify: "قد نطلب معلومات إضافية للتحقق عند الاشتباه بانتحال أو إساءة استخدام.",
          },
        },

        updates: {
          title: "7) التعديلات وإنهاء الخدمة",
          items: {
            terms: "قد نقوم بتحديث هذه الشروط من وقت لآخر، ويعد استمرارك في الاستخدام موافقة على التحديث.",
            service: "يجوز لنا إيقاف أو تعديل أو إنهاء الخدمة أو بعض المزايا دون إشعار مسبق عند الحاجة.",
          },
        },
      },

      footer: "باستخدامك للتطبيق، أنت توافق على جميع البنود المذكورة أعلاه.",
    },
    changePassword: {
      title: "تغيير كلمة المرور",
      currentPasswordLabel: "كلمة المرور الحالية",
      currentPasswordPlaceholder: "••••••••",
      newPasswordLabel: "كلمة المرور الجديدة",
      newPasswordPlaceholder: "على الأقل 6 أحرف",
      confirmPasswordLabel: "تأكيد كلمة المرور الجديدة",
      confirmPasswordPlaceholder: "••••••••",

      alerts: {
        confirmMismatch: "تأكيد كلمة المرور غير مطابق",
        success: "تم تغيير كلمة المرور بنجاح",
      },

      note: "نصيحة: استخدم كلمة مرور قوية ولا تشاركها مع أي شخص.",
    },


    about: {
      headerTitle: "حول التطبيق",
      headerSub: "معلومات عامة عن {{appName}}",
      versionLabel: "الإصدار {{version}}",

      descPrefix: "{{appName}} تطبيق اجتماعي حديث يهدف إلى توفير تجربة تواصل",
      simple: "بسيطة",
      and: "و",
      safe: "آمنة",
      fast: "سريعة",
      descSuffix: "للمستخدمين، مع تحسينات مستمرة على الأداء والخصوصية وتجربة الاستخدام.",

      features: {
        privacy: {
          title: "خصوصية",
          sub: "تحكم أعلى في بياناتك",
        },
        performance: {
          title: "أداء",
          sub: "واجهة سلسة واستجابة سريعة",
        },
        community: {
          title: "مجتمع",
          sub: "غرف ودردشة وتفاعل",
        },
        experience: {
          title: "تجربة",
          sub: "تصميم عصري ومريح",
        },
      },

      info: {
        platform: "المنصة",
        service: "الخدمة",
        security: "الأمان",
      },

      footer: "شكرًا لاستخدامك {{appName}}. نحن نعمل دائمًا على تطوير التطبيق وتحسينه.",
    },
    verifyResetCodeScreen: {
      title: "إدخال كود التحقق",
      subtitle: "أدخل كود OTP المرسل إلى بريدك الإلكتروني",
      otpPH: "أدخل الكود",
      verifyBtn: "تأكيد الكود",
      verifyingBtn: "جارٍ التحقق...",
      resendBtn: "إعادة إرسال الكود",
      resendingBtn: "جارٍ إعادة الإرسال...",
      loginBack: "العودة لتسجيل الدخول",
      missingEmail: "لم يتم العثور على البريد الإلكتروني، أعد طلب الكود أولًا",
      otpExpired: "انتهت صلاحية الكود، أعد إرسال كود جديد",

      codeValidity: "صلاحية الكود",
      resendLabel: "إعادة الإرسال",
      availableNow: "متاح الآن",
      secondsShort: "{{seconds}} ث",
      resendIn: "إعادة الإرسال خلال {{seconds}} ثانية",

      toasts: {
        expiredTitle: "انتهت الصلاحية",
        checkOtp: "تحقق من كود التحقق",
        verifiedTitle: "تم التحقق",
        verifiedMessage: "يمكنك الآن تعيين كلمة مرور جديدة",
        verifyFailedTitle: "فشل التحقق",
        waitTitle: "انتظر قليلًا",
        resendAfter: "يمكنك إعادة الإرسال بعد {{seconds}} ثانية",
        sentTitle: "تم الإرسال",
        resentMessage: "تمت إعادة إرسال كود التحقق",
      },

      errors: {
        otpRequired: "يرجى إدخال كود التحقق",
        otpInvalid: "كود التحقق يجب أن يكون أرقامًا فقط من 4 إلى 8 خانات",
        missingEmail: "لم يتم العثور على البريد الإلكتروني، أعد طلب الكود أولًا",
        otpExpired: "انتهت صلاحية الكود، أعد إرسال كود جديد",
        verifyFailed: "كود التحقق غير صحيح أو منتهي الصلاحية",
        resendFailed: "تعذر إعادة إرسال الكود",
      },
    },
    languageSettings: {
      headerTitle: "اللغة",
      headerSub: "اختر لغة التطبيق المناسبة لك",
      info: "سيتم تطبيق اللغة المختارة على معظم أجزاء التطبيق فورًا أو بعد إعادة فتح بعض الشاشات.",
      footer: "يمكنك تغيير اللغة في أي وقت من الإعدادات.",
      languages: {
        ar: "العربية",
        en: "الإنجليزية",
      },
    },
    changeEmail: {
  title: "تغيير البريد الإلكتروني",
  currentEmailLabel: "البريد الحالي",
  newEmailLabel: "البريد الجديد",
  newEmailPlaceholder: "example@email.com",
  unavailable: "غير متوفر",
  saveButton: "حفظ البريد الجديد",

  note: "تأكد من إدخال بريد صحيح ويمكن الوصول إليه، لأنه قد يُستخدم لاحقًا في استعادة الحساب أو التحقق.",

  errors: {
    required: "يرجى إدخال البريد الإلكتروني",
    invalid: "يرجى إدخال بريد إلكتروني صحيح",
    sameAsCurrent: "هذا هو نفس البريد الحالي",
  },

  toasts: {
    success: "تم تغيير البريد الإلكتروني",
    failed: "فشل تغيير البريد الإلكتروني",
    unexpected: "حدث خطأ غير متوقع",
  },
},


    resetPasswordScreen: {
      title: "تعيين كلمة مرور جديدة",
      subtitle: "أدخل كلمة المرور الجديدة ثم أكدها للمتابعة",
      passwordPH: "كلمة المرور الجديدة",
      confirmPasswordPH: "تأكيد كلمة المرور الجديدة",
      saveBtn: "حفظ كلمة المرور",
      savingBtn: "جارٍ الحفظ...",
      backLogin: "العودة لتسجيل الدخول",

      toasts: {
        checkPassword: "تحقق من كلمة المرور الجديدة",
        resetSuccess: "تم تغيير كلمة المرور بنجاح",
        operationFailedTitle: "فشل العملية",
        requestError: "حدث خطأ أثناء تغيير كلمة المرور",
      },

      errors: {
        missingData:
          "بيانات إعادة التعيين غير مكتملة، أعد طلب كود التحقق أولًا",
        passwordRequired: "يرجى إدخال كلمة المرور الجديدة",
        passwordNoSpaces: "كلمة المرور لا يجب أن تحتوي على مسافات",
        passwordInvalid:
          "كلمة المرور غير صالحة. مسموح: عربي/إنجليزي/أرقام + رموز محددة وطول من 6 إلى 64",
        confirmPasswordRequired: "يرجى تأكيد كلمة المرور",
        passwordsMismatch: "كلمتا المرور غير متطابقتين",
        resetFailed: "تعذر تغيير كلمة المرور، حاول مرة أخرى",
      },
    },
    forgotPasswordScreen: {
      title: "استعادة كلمة المرور",
      subtitle: "أدخل بريدك الإلكتروني لإرسال كود التحقق",
      inputPH: "البريد الإلكتروني",
      sendBtn: "إرسال الكود",
      sendingBtn: "جارٍ الإرسال...",
      backBtn: "العودة لتسجيل الدخول",

      toasts: {
        checkEmail: "تحقق من البريد الإلكتروني",
        sentTitle: "تم الإرسال",
        sentMessage: "إذا كان البريد موجودًا فسيصلك كود التحقق",
        sendFailedTitle: "فشل الإرسال",
        requestError: "حدث خطأ أثناء إرسال الطلب",
      },

      errors: {
        emailRequired: "يرجى إدخال البريد الإلكتروني",
        emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
        sendFailed: "تعذر إرسال كود التحقق، حاول مرة أخرى",
      },
    },
    chooseLocationScreen: {
      title: "اختر موقعك",
      subtitle:
        "يجب اختيار الدولة على الأقل، ويمكنك اختيار المدينة بشكل اختياري.",
      countryLabel: "الدولة *",
      cityLabel: "المدينة (اختياري)",
      selectCountry: "اختر الدولة",
      selectCity: "اختر المدينة",
      selectCountryFirst: "اختر الدولة أولًا",
      saveAndContinue: "حفظ ومتابعة",
      continueBtn: "متابعة",

      errors: {
        countryRequired: "يرجى اختيار الدولة أولًا",
        countryMinimum: "يجب اختيار الدولة على الأقل",
        saveFailed: "فشل حفظ الموقع",
        continueFailed: "فشل المتابعة",
      },
    },

    registerScreen: {
      title: "إنشاء حساب",
      subtitle: "انضم إلى المحادثة",
      usernamePH: "اسم المستخدم",
      passwordPH: "كلمة المرور",
      confirmPH: "تأكيد كلمة المرور",
      captchaPH: "كابتشا: {{a}} + {{b}} = ؟",
      refreshCaptcha: "تحديث الكابتشا",
      registerBtn: "إنشاء حساب",
      loadingBtn: "جارٍ الإنشاء...",
      loginLine: "لديك حساب بالفعل؟ ",
      loginLink: "تسجيل الدخول",

      toasts: {
        checkInputs: "تحقق من البيانات المدخلة",
        registerSuccess: "تم إنشاء الحساب",
        registerFailedTitle: "فشل إنشاء الحساب",
      },

      errors: {
        usernameRequired: "يرجى إدخال اسم المستخدم",
        usernameNoSpaces: "اسم المستخدم لا يجب أن يحتوي على مسافات",
        usernameInvalid:
          "اسم المستخدم غير صالح. مسموح: عربي/إنجليزي/أرقام + الرموز ( . _ - ) وطول من 3 إلى 64",
        passwordRequired: "يرجى إدخال كلمة المرور",
        passwordNoSpaces: "كلمة المرور لا يجب أن تحتوي على مسافات",
        passwordInvalid:
          "كلمة المرور غير صالحة. مسموح: عربي/إنجليزي/أرقام + رموز محددة وطول من 6 إلى 64",
        confirmRequired: "يرجى تأكيد كلمة المرور",
        passwordsMismatch: "كلمتا المرور غير متطابقتين",
        captchaRequired: "يرجى إدخال ناتج الكابتشا",
        captchaInvalid: "الكابتشا غير صحيحة",
        registerFailed: "تعذر إنشاء الحساب",
        unexpected: "حدث خطأ غير متوقع",
      },
    },
    loginScreen: {
      title: "مرحبًا بعودتك",
      subtitle: "سجّل الدخول للمتابعة",
      usernamePH: "اسم المستخدم",
      passwordPH: "كلمة المرور",
      loginBtn: "تسجيل الدخول",
      loadingBtn: "جارٍ تسجيل الدخول...",
      forgotPassword: "نسيت كلمة المرور؟",
      registerLine: "ليس لديك حساب؟ ",
      registerLink: "إنشاء حساب",

      toasts: {
        checkInputs: "تحقق من البيانات المدخلة",
        loginSuccess: "تم تسجيل الدخول",
        loginFailed: "فشل تسجيل الدخول",
      },

      errors: {
        usernameRequired: "يرجى إدخال اسم المستخدم",
        usernameNoSpaces: "اسم المستخدم لا يجب أن يحتوي على مسافات",
        usernameInvalid:
          "اسم المستخدم غير صالح. المسموح: عربي/إنجليزي/أرقام + . _ - والطول من 3 إلى 64",
        passwordRequired: "يرجى إدخال كلمة المرور",
        passwordNoSpaces: "كلمة المرور لا يجب أن تحتوي على مسافات",
        passwordInvalid:
          "كلمة المرور غير صالحة. مسموح: عربي/إنجليزي/أرقام + رموز محددة وطول من 6 إلى 64",
        invalidCredentials: "بيانات غير صحيحة",
        unexpected: "حدث خطأ غير متوقع",
      },
    },

    settingsScreen: {
      header: "الإعدادات",

      account: "الحساب",
      editProfile: "تعديل الملف الشخصي",
      verifyAccount: "تأكيد الحساب",

      privacy: "الخصوصية",
      onlineStatus: "الحالة متصل الآن",
      readReceipts: "إيصالات القراءة",
      locationSharing: "مشاركة الموقع",
      blockedAccounts: "الحسابات المحظورة",
      changeEmail: "تغير البريد",

      notifications: "الإشعارات",
      notificationToggle: "الإشعارات",
      notificationSounds: "أصوات الإشعارات",

      appearance: "المظهر",
      darkMode: "الوضع الليلي",
      theme: "الألوان والثيم",
      fontSize: "حجم الخط",
      profilePhotoCover: "الصورة الشخصية والغلاف",
      changePassword: "تغيير كلمة السر",
      media: "الوسائط",
      autoPlayVideos: "تشغيل الفيديو تلقائيًا",
      dataUsage: "استخدام البيانات",

      security: "الأمان",
      biometricLock: "قفل التطبيق بالبصمة",
      twoFactor: "التحقق بخطوتين",
      loginAlerts: "تنبيهات تسجيل الدخول",

      app: "التطبيق",
      language: "اللغة",
      aboutApp: "حول التطبيق",
      helpSupport: "المساعدة والدعم",
      privacyPolicy: "سياسة الخصوصية",
      termsConditions: "الشروط والأحكام",

      logout: "تسجيل الخروج",
      version: "Bimo v1.0.0",
    },
    tweetsScreen: {
      followingTab: "المتابَعون",
      forYouTab: "من أجلك",
      delete: "حذف",
      follow: "متابعة",
      following: "تتم متابعته",
      unfollow: "إلغاء المتابعة",
      block: "حظر",
      report: "إبلاغ",
    }
  },
};
