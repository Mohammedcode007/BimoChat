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
      user: "User",
      save: "Save",


    },
    tweetDetailsScreen: {
  title: "Post",
  notAvailable: "Post not available",
  user: "User",
  video: "Video",
  embeddedVideo: "Embedded video",
  views: "views",
  reposts: "Reposts",
  quotes: "Quotes",
  likes: "Likes",
  mostRelevantReplies: "Most relevant replies",
  noReplies: "No replies yet",
  beFirstToReply: "Be the first to reply",
  replyPlaceholder: "Post your reply",
  deletePost: "Delete Post",
  report: "Report",
  share: "Share",
  removeBookmark: "Remove Bookmark",
  bookmark: "Bookmark",
  cancel: "Cancel",
},
    friendsScreenLAN: {
      searchPlaceholder: "Search friends",
      suggested: "Suggested",
      add: "Add",
      remove: "Remove",
      deleteTitle: "Confirm removal",
      deleteMessage: "Are you sure you want to remove this friend?",
      noMatching: "No matching friends",
      noFriendsYet: "No friends yet",
      tryAnother: "Try another name.",
      addFriendsHint: "Add friends to start chatting instantly.",
      addFriend: "Add friend",
      noBio: "No bio",
      confirmRemove: "Remove",
    },

    stories: {
      myStory: "Your story",
      add: "Add",
      noStories: "No stories",
    },

    status: {
      online: "Online",
      lastSeen: "Last seen",
      now: "Now",
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
    suggestedFriends: {
      title: "Suggested friends",
      subtitle: "People you may want to add and connect with",
      loading: "Loading suggestions...",
      emptyTitle: "No suggestions right now",
      emptyText: "Add your city and interests to get better suggestions",

      online: "Online",

      add: "Add",
      cancelRequest: "Cancel request",
      pendingYou: "Waiting for you",
      friends: "Friends",
      blocked: "Blocked",
      blockedYou: "Blocked you",
    },
    chatssCREENlAN: {
      searchPlaceholder: "Search chats",
      startChatting: "Start chatting...",
      messageDeleted: "Message deleted",
      photo: "📷 Photo",
      voiceMessage: "🎙 Voice message",
      online: "Online",
      typing: "typing...",
      deleteChat: "Delete Chat",
    },
    storyCreate: {
      title: "Add story",

      textTab: "Text",
      imageTab: "Image",
      videoTab: "Video",

      privacy: "Privacy",
      followers: "Friends",
      public: "Public",
      private: "Private",

      storyText: "Story text",
      storyTextPlaceholder: "Write your story...",

      imageFile: "Image file",
      videoFile: "Video file",
      chooseFromDevice: "Choose from device",
      changeFile: "Change file",
      optionalComment: "Comment (optional)",
      commentPlaceholder: "Write a comment...",

      size: "Size",
      uploaded: "Uploaded",

      preparingImage: "Preparing image...",
      preparingVideo: "Preparing video...",
      videoCompressedUploading: "Video compressed - uploading...",
      videoNotCompressedUploading: "Compression unavailable - uploading...",
      uploadingImage: "Uploading image...",
      uploadSuccess: "Uploaded successfully ✓",

      waitTitle: "Please wait",
      waitMessage: "Please wait until upload finishes.",
      missingDataTitle: "Missing data",
      missingTextMessage: "Write the story text.",
      missingFileMessage: "Choose a file.",
      permissionTitle: "Permissions",
      permissionMessage: "You need to grant access to photos/videos.",
      operationFailed: "Operation failed",
      genericError: "An error occurred.",
      noFileSelected: "No file selected.",
      uploadFailed: "An error occurred while uploading the file.",
      uploadParseFailed: "Failed to parse upload response.",
      networkUploadError: "Network error during upload.",

      publishLoading: "Publishing...",
      uploadLoading: "Uploading...",
      publishStory: "Publish story",

      noteStoriesLimit:
        "* The backend prevents adding more than two active stories. If you delete one, you can add another.",
      noteVideoCompression:
        "* Video compression only works in Bare or Expo Dev Client, not Expo Go.",
    },
    addFriend: {
      title: "Add Friends",
      subtitle: "Search, then send a request or start chatting",
      searchPlaceholder: "Search users...",
      noUsersFound: "No users found",

      add: "Add",
      cancel: "Cancel",
      pending: "Pending",
      friends: "Friends",
      blocked: "Blocked",
      blockedYou: "Blocked You",
      online: "Online",
    },
    storeScreen: {
      tabs: {
        all: "All",
        coinz: "Coinz",
        avatarFrame: "Frames",
        badge: "Badges",
        messageEffect: "Effects",
        profileEntryAnimation: "Entry",
        gift: "Gifts",
        bundles: "Bundles",
        limited: "Limited",
      },

      prettyType: {
        avatarFrame: "Avatar Frame",
        badge: "Badge",
        messageEffect: "Message Effect",
        gift: "Gift",
        profileEntryAnimation: "Profile Entry",
        verification: "Verification",
        item: "Item",
      },

      common: {
        ok: "OK",
        none: "None",
        owned: "Owned",
        active: "Active",
        deactivate: "Deactivate",
        activate: "Activate",
        activating: "Activating...",
        expired: "Expired",
        custom: "Custom",
        days30: "30 days",
        coinz: "Coinz",
        service: "Service",
        oneTime: "One-time",
        cost: "Cost",
        insufficient: "Insufficient",
        create: "Create",
        details: "Details",
        duration: "Duration:",
        expires: "Expires:",
        permanent: "Permanent",
        permanentLower: "permanent",
        timed: "Timed",
        new: "New",
        bundle: "Bundle",
        limited: "Limited",
        price: "Price",
        buy: "Buy",
        img: "IMG",
        loading: "Loading...",
        pleaseWait: "Please wait...",
        cancel: "Cancel",
        close: "Close",
        info: "Info",
        use: "Use",
        applying: "Applying...",
        remove: "Remove",
        add: "Add",
        yourBalance: "Your balance:",
        qty: "qty:",
        daysSuffix: "day(s)",
      },

      wallet: {
        title: "Wallet",
        subtitle: "Use Coinz to unlock frames, badges, effects and more.",
        buyCoinz: "Buy Coinz",
      },

      active: {
        frame: "Frame",
        effect: "Effect",
        entry: "Entry",
        badges: "Badges",
        emojiBadge: "Emoji Badge",
      },

      search: {
        coinz: "Search coinz packs...",
        store: "Search store items...",
      },

      sections: {
        coinzPacks: "Coinz Packs",
        store: "Store",
        coinzSub: "Secure checkout via Paymob.",
        storeSub: "Pick something and personalize your profile.",
      },

      coinzPacks: {
        p1: { title: "Starter", subtitle: "100 Coinz" },
        p2: { title: "Popular", subtitle: "260 Coinz" },
        p3: { title: "Pro", subtitle: "550 Coinz" },
      },

      coinz: {
        buyTitle: "Buy Coinz",
        paymentUrlMissing: "Payment URL not returned.",
        paymentCreateFailed: "Failed to create payment",
        youGet: "You get",
        redirecting: "Redirecting...",
        buyNow: "Buy Now",
        redirectNote: "You will be redirected to Paymob checkout to complete your payment.",
        redirectDetails: "You will be redirected to Paymob checkout to complete payment.",
      },

      customEmoji: {
        title: "Custom Emoji Badge",
        cardTitle: "Custom Emoji Badge",
        cardDesc: "Buy your own single emoji badge and choose whether to activate it immediately.",
        current: "Current:",
        noneOwned: "You have not purchased a custom emoji badge yet.",
        replaceBadge: "Replace Badge",
        buyBadge: "Buy Badge",
        enterEmoji: "Please enter one emoji.",
        notOwnedYet: "You do not own a custom emoji badge yet.",
        expiredBuyAgain: "Your custom emoji badge has expired. Please buy again.",
        enterOneEmoji: "Enter one emoji only. Price:",
        emojiField: "Emoji",
        preview: "Preview",
        activateNow: "Activate now",
        saving: "Saving...",
        noBadgeTitle: "No custom emoji badge",
        noBadgeSub: "Buy one from the card above to use it on your profile.",
        ownedTitle: "Custom Badge",
        emojiLabel: "Emoji:",
      },

      createAccount: {
        title: "Create Account",
        cardTitle: "Create Account",
        cardDescPrefix: "Create a new account and pay",
        cardDescSuffix: "from your balance.",
        detailsMessage: "After success you can copy username and password.",
        usernameRequired: "Username is required",
        passwordMin: "Password must be at least 6 characters",
        insufficientBalance: "Insufficient Coinz balance",
        debitFailed: "Failed to debit coinz",
        registrationFailed: "Registration failed",
        usernameField: "Username",
        passwordField: "Password",
        usernamePlaceholder: "username",
        passwordPlaceholder: "password",
        creating: "Creating...",
      },

      createdAccount: {
        title: "Account Created",
        copy: "Copy",
        copying: "Copying...",
      },

      purchase: {
        title: "Purchase",
        quantity: "Quantity",
        autoActivate: "Auto-activate",
        total: "Total",
        buying: "Buying...",
        confirm: "Confirm",
      },

      inventory: {
        title: "Your Inventory",
        subtitle: "Manage items you already own.",
        noItemsTitle: "No items yet",
        noItemsSub: "Buy something from the store to see it here.",
      },

      empty: {
        noCoinzPacks: "No coinz packs found",
        noItems: "No items match your search",
        tryKeyword: "Try a different keyword.",
      },

      alerts: {
        storeTitle: "Store",
        alreadyOwnedTitle: "Already owned",
        alreadyOwnedMessage: "You already own this item.",
        expiredTitle: "Expired",
        expiredItemMessage: "This item has expired. Please renew or buy again.",
        invalidItemTitle: "Invalid item",
        verificationTypeMissing: "verificationType is missing in item.meta",
        copiedTitle: "Copied",
        credentialsCopied: "Credentials copied to clipboard",
      },
    },
    editProfile: {
      countries: {
        egypt: "Egypt",
        saudiArabia: "Saudi Arabia",
        uae: "United Arab Emirates",
        unitedStates: "United States",
        morocco: "Morocco",
      },

      alerts: {
        permissionTitle: "Notice",
        permissionMessage: "You must allow photo access to choose an image.",
        successTitle: "Done",
        successMessage: "Profile updated successfully",
        errorTitle: "Error",
        errorFallback: "Something went wrong",
      },

      loading: {
        title: "Saving changes...",
        subtitle: "Please wait a moment",
      },

      actions: {
        changeCover: "Change Cover",
        saveChanges: "Save Changes",
      },

      header: {
        title: "Edit Profile",
        subtitle: "Update your information, photo, country, and bio",
      },

      fields: {
        username: "Username",
        country: "Country",
        bio: "Bio",
      },

      placeholders: {
        username: "@username",
        country: "Select country",
        search: "Search...",
        bioPreview: "Tap to add a bio",
        bioEditor: "Write a bio...",
      },

      footerHint: "Images will be uploaded automatically, then your data will be saved.",

      modal: {
        cancel: "Cancel",
        title: "Edit Bio",
        save: "Save",
        hint: "Note: You can use formatting such as Bold and Lists.",
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
    notifications: {
      title: "Notifications",
      all: "All",
      unread: "Unread",
      requests: "Requests",
      read: "Read",
      delete: "Delete",
      emptyTitle: "No notifications",
      emptySub: "Everything new related to your account will appear here.",
      unknownUser: "User",
      others: "others",
      newNotification: "New notification",
      dash: "—",

      types: {
        tweet_like: "liked your post",
        tweet_reply: "replied to your post",
        follow: "started following you",
        friend_request: "sent you a friend request",
        message: "sent a message",
        room_invite: "room invitation",
        default: "New notification",
      },
    },
    roomsScreenLan: {
      searchPlaceholder: "ابحث عن الغرف",
      tabs: {
        all: "الكل",
        active: "النشطة",
        trending: "الرائجة",
        vip: "VIP",
        private: "الخاصة",
      },

      membersCount: "{{current}}/{{max}} عضو",
      onlineCount: "{{count}} متصل",

      badges: {
        banned: "محظور",
        active: "نشطة",
        trending: "رائجة",
        vip: "VIP",
        verified: "موثقة",
        voice: "صوتية",
        protected: "مقفلة",
        private: "خاصة",
      },

      roomFallbackName: "غرفة",

      refreshFailed: "فشل التحديث",
      loadMoreFailed: "فشل تحميل المزيد",
      searchFailed: "فشل البحث",
      createRoomFailed: "فشل إنشاء الغرفة",
      enterRoomFailed: "فشل الدخول إلى الغرفة",
      joinFailed: "فشل الانضمام",
      bannedRoom: "أنت محظور من هذه الغرفة",
      passwordRequired: "كلمة المرور مطلوبة",
      roomNameRequired: "اسم الغرفة مطلوب",
      roomNameExists: "اسم الغرفة موجود بالفعل",

      createRoom: "إنشاء غرفة",
      roomName: "اسم الغرفة",
      cancel: "إلغاء",
      create: "إنشاء",
      creating: "جارٍ الإنشاء...",

      enterPassword: "أدخل كلمة المرور",
      roomPassword: "كلمة مرور الغرفة",
      join: "انضمام",
      joining: "جارٍ الانضمام...",

      loading: "جارٍ التحميل...",
      searching: "جارٍ البحث...",
      noRoomsFound: "لا توجد غرف",
      loadingMore: "جارٍ تحميل المزيد...",

      creatingRoomTitle: "جارٍ إنشاء الغرفة...",
      creatingRoomSubtitle: "يرجى الانتظار قليلًا",
    },
    profileScreenLan: {
      verified: "Verified",
      activeNow: "Active now",
      offline: "Offline",
      unspecified: "Unspecified",

      message: "Message",
      startChat: "Start chat",
      startChatNow: "Start now",
      typeFirstMessage: "Write your first message...",
      close: "Close",

      add: "Add",
      friends: "Friends",
      cancel: "Cancel",
      pending: "Pending",
      unblock: "Unblock",
      blockedYou: "Blocked You",

      follow: "Follow",
      following: "Following",

      followers: "Followers",
      followingCount: "Following",
      likes: "Likes",
      views: "Views",

      noBioYet: "No bio yet.",
      about: "About",
      posts: "Posts",
      media: "Media",

      basicInfo: "Basic information",
      username: "Username",
      country: "Country",

      noPostsYet: "No posts yet",
      postsApiHint: "This section will show the user's posts when connected to the API.",
      mediaLabel: "Media",
      mediaPrivacyHint: "Media display is controlled by privacy settings.",

      footerNote:
        "Please communicate respectfully. Abuse or inappropriate requests may be reported and the account may be blocked according to the platform policy.",

      loadingProfile: "Loading profile...",
      profileLoadFailed: "Failed to load profile",
      retry: "Retry",
      noData: "No profile data to display",

      friendSheetAcceptedTitle: "Already friends",
      friendSheetAcceptedSub: "You are already friends.",
      friendSheetPendingSentTitle: "Cancel friend request?",
      friendSheetPendingSentSub: "The sent request will be cancelled.",
      friendSheetPendingReceivedTitle: "Incoming friend request",
      friendSheetPendingReceivedSub: "The request is waiting for your approval.",
      friendSheetBlockedByMeTitle: "Unblock",
      friendSheetBlockedByMeSub: "This account will be unblocked.",
      friendSheetBlockedMeTitle: "This account blocked you",
      friendSheetBlockedMeSub: "You cannot send a friend request.",
      friendSheetAddTitle: "Add friend",
      friendSheetAddSub: "A friend request will be sent to this account.",

      followSheetFollowingTitle: "Unfollow?",
      followSheetFollowTitle: "Follow account",
      followSheetBlockedSub: "You cannot follow because this account blocked you.",
      followSheetFollowingSub: "You will stop seeing this account's updates in following.",
      followSheetFollowSub: "You will receive this account's updates according to your settings.",

      blockSheetBlockedTitle: "Blocked",
      blockSheetUnblockTitle: "Unblock",
      blockSheetBlockTitle: "Block account",
      blockSheetBlockedMeSub: "You cannot manage blocking because this account blocked you.",
      blockSheetUnblockSub: "This account will be able to interact with you according to settings.",
      blockSheetBlockSub: "This account will no longer be able to message or interact with you.",
      blockNoteBlockedMe: "This account has blocked you, so you cannot send messages or requests.",
      blockNoteUnblock: "You are about to unblock this account.",
      blockNoteBlock: "Blocking is a strong action to protect your privacy.",
      confirmBlock: "Confirm block",

      reportTitle: "Report account",
      reportSub: "Choose a reason and add details if needed. It will be handled confidentially.",
      reportReason: "Report reason",
      reportDetails: "Additional details (optional)",
      send: "Send",

      shareTitle: "Share profile",
      shareSub: "Choose a sharing method or copy the profile link.",
      copyLink: "Copy link",
      copyLinkSub: "Copy the profile link to the clipboard.",
      sendToFriend: "Send to a friend",
      sendToFriendSub: "Choose a chat to send the link.",

      editBioTitle: "Edit bio",
      editBioSub: "This is UI only. Connect it later to /me/settings.",
      writeNewBio: "Write a new bio...",
      save: "Save",

      tagTitle: "Interest / tag",
      tagSub: "Interactive example (mock).",
      similarProfiles: "Show similar profiles",
      similarProfilesSub: "Suggestions based on this tag.",
      saveInterest: "Save as interest",
      saveInterestSub: "Add this tag to your interests.",

      mediaSheetTitle: "Media",
      mediaSheetSub: "Media display depends on privacy settings (mock).",
      mediaSheetNote: "To display media for real: connect the grid to image data and open a viewer screen.",

      moreTitle: "More options",
      moreSub: "Quick account actions.",
      messaging: "Messaging",
      messagingSub: "Start a direct chat.",
      friendship: "Friendship",
      friendshipSub: "Add / cancel request / show status.",
      reportAction: "Report",
      reportActionSub: "Report inappropriate behavior.",
      blockActionSub: "Prevent interaction with you.",

      cannotMessageBlockedByThem: "You cannot message this account because they blocked you.",
      cannotMessageBlockedByMe: "You cannot message this account because you blocked it.",
      messageWillSendTo: "A message will be sent to {{name}}",
      cannotCommunicate: "You cannot communicate with this account.",
      unblockFirstToMessage: "Unblock first to send a message.",
    },
    profileSettings: {
      headerTitle: "Profile Settings",
      headerSub: "Quick editing with dark mode support",
      loading: "Loading your data...",

      theme: {
        dark: "Dark",
        light: "Light",
      },

      actions: {
        save: "Save",
        saving: "Saving...",
        back: "Back",
      },

      quickSummary: {
        title: "Quick Summary",
        subtitle: "Mini preview after your changes",
      },

      basic: {
        title: "Basic Information",
        subtitle: "Display name, username, and location",
        readOnly: "Read only",
        fields: {
          displayName: "Display Name",
          username: "Username",
          city: "City",
          country: "Country",
          bio: "Bio",
        },
        placeholders: {
          displayName: "Enter display name",
          username: "@username",
          city: "Enter city",
          country: "Enter country",
          bio: "Write a short bio about yourself",
        },
      },

      media: {
        title: "Media",
        subtitle: "Quick control over media visibility",
        allowMedia: {
          title: "Allow media display",
          subtitle: "Control showing the media grid inside the profile.",
        },
      },

      partner: {
        title: "Life Partner Preferences",
        subtitle: "Optional fields",
        fields: {
          ageRange: "Preferred Age Range",
          location: "Location",
          maritalStatus: "Marital Status",
          religiosity: "Religiosity",
        },
        placeholders: {
          ageRange: "Example: 25 - 32",
          location: "City or country",
          maritalStatus: "Example: Single",
          religiosity: "Example: Practicing",
        },
      },

      interests: {
        title: "Interests",
        subtitle: "Choose tags shown on your profile",
      },

      tags: {
        calm: "Calm",
        respect: "Respect",
        reading: "Reading",
        education: "Education",
        lightSports: "Light Sports",
        familyLife: "Family Life",
        travel: "Travel",
        volunteering: "Volunteering",
      },

      privacy: {
        title: "Privacy",
        subtitle: "Control visibility and messaging",

        profileVisible: {
          title: "Show profile to others",
          subtitle: "When disabled, your profile appears in a limited way.",
        },
        lastActive: {
          title: "Show last active",
          subtitle: "Hide “active since …”.",
        },
        allowMessages: {
          title: "Allow messages",
          subtitle: "Who can start a conversation with you.",
        },
      },

      notifications: {
        title: "Notifications",
        subtitle: "Messages, likes, and follows",

        messages: {
          title: "Message notifications",
          subtitle: "Get notified when a message arrives.",
        },
        likes: {
          title: "Like notifications",
          subtitle: "Get notified when someone likes your profile.",
        },
        follows: {
          title: "Follow notifications",
          subtitle: "Get notified when someone follows you.",
        },
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
      title: "One step away",
      subtitle: "Enter your new world",
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
      title: "We missed you",
      subtitle: "Pick up right where you left off",
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
      post: "Post",
      postNotAvailable: "Post not available",
      noRepliesYet: "No replies yet",
      beFirstReply: "Be the first to reply.",
      postYourReply: "Post your reply",
      deletePost: "Delete Post",
      share: "Share",
      bookmark: "Bookmark",
      removeBookmark: "Remove Bookmark",
      relevantReplies: "Most relevant replies",
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
      user: "مستخدم",
      save: "حفظ",


    },
    friendsScreenLAN: {
      searchPlaceholder: "ابحث عن الأصدقاء",
      suggested: "المقترحون",
      add: "إضافة",
      remove: "إزالة",
      deleteTitle: "تأكيد الحذف",
      deleteMessage: "هل أنت متأكد أنك تريد إزالة هذا الصديق؟",
      noMatching: "لا يوجد أصدقاء مطابقون",
      noFriendsYet: "لا يوجد أصدقاء بعد",
      tryAnother: "جرّب اسمًا آخر.",
      addFriendsHint: "أضف أصدقاء لبدء المحادثة فورًا.",
      addFriend: "إضافة صديق",
      noBio: "لا توجد نبذة",
      confirmRemove: "إزالة",
    },
 
    roomsScreenLan: {
      searchPlaceholder: "Search rooms",
      tabs: {
        all: "All",
        active: "Active",
        trending: "Trending",
        vip: "VIP",
        private: "Private",
      },

      membersCount: "{{current}}/{{max}} members",
      onlineCount: "{{count}} online",

      badges: {
        banned: "Banned",
        active: "Active",
        trending: "Trending",
        vip: "VIP",
        verified: "Verified",
        voice: "Voice",
        protected: "Protected",
        private: "Private",
      },

      roomFallbackName: "Room",

      refreshFailed: "Refresh failed",
      loadMoreFailed: "Load more failed",
      searchFailed: "Search failed",
      createRoomFailed: "Create room failed",
      enterRoomFailed: "Enter room failed",
      joinFailed: "Join failed",
      bannedRoom: "You are banned from this room",
      passwordRequired: "Password is required",
      roomNameRequired: "Room name is required",
      roomNameExists: "Room name already exists",

      createRoom: "Create Room",
      roomName: "Room name",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",

      enterPassword: "Enter Password",
      roomPassword: "Room password",
      join: "Join",
      joining: "Joining...",

      loading: "Loading...",
      searching: "Searching...",
      noRoomsFound: "No rooms found",
      loadingMore: "Loading more...",

      creatingRoomTitle: "Creating room...",
      creatingRoomSubtitle: "Please wait a moment",
    },
    stories: {
      myStory: "حالتك",
      add: "إضافة",
      noStories: "لا توجد حالات",
    },

    status: {
      online: "متصل",
      lastSeen: "آخر ظهور",
      now: "الآن",
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
    tweetDetailsScreen: {
      title: "نشر",
      notAvailable: "المنشور غير متاح",
      user: "مستخدم",
      video: "فيديو",
      embeddedVideo: "فيديو مضمن",
      views: "من المشاهدات",
      reposts: "المنشورات المعاد نشرها",
      quotes: "اقتباسات",
      likes: "إعجابات",
      mostRelevantReplies: "الردود الأكثر صلة",
      noReplies: "لا توجد ردود بعد",
      beFirstToReply: "كن أول من يرد",
      replyPlaceholder: "انشر ردك",
      deletePost: "حذف المنشور",
      report: "إبلاغ",
      share: "مشاركة",
      removeBookmark: "إزالة الحفظ",
      bookmark: "حفظ",
      cancel: "إلغاء",
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

    editProfile: {
      countries: {
        egypt: "مصر",
        saudiArabia: "السعودية",
        uae: "الإمارات",
        unitedStates: "الولايات المتحدة",
        morocco: "المغرب",
      },

      alerts: {
        permissionTitle: "تنبيه",
        permissionMessage: "يجب السماح بالوصول للصور لاختيار صورة.",
        successTitle: "تم",
        successMessage: "تم تحديث الملف الشخصي بنجاح",
        errorTitle: "خطأ",
        errorFallback: "حدث خطأ",
      },

      loading: {
        title: "جاري حفظ التعديلات...",
        subtitle: "الرجاء الانتظار لحظات",
      },

      actions: {
        changeCover: "تغيير الغلاف",
        saveChanges: "حفظ التغييرات",
      },

      header: {
        title: "تعديل الملف الشخصي",
        subtitle: "حدّث بياناتك وصورتك وبلدك والنبذة التعريفية",
      },

      fields: {
        username: "المعرّف",
        country: "الدولة",
        bio: "النبذة التعريفية",
      },

      placeholders: {
        username: "@username",
        country: "اختر الدولة",
        search: "ابحث...",
        bioPreview: "اضغط لإضافة نبذة تعريفية",
        bioEditor: "اكتب نبذة تعريفية...",
      },

      footerHint: "سيتم رفع الصور تلقائيًا ثم حفظ البيانات.",

      modal: {
        cancel: "إلغاء",
        title: "تعديل النبذة",
        save: "حفظ",
        hint: "ملاحظة: يمكنك استخدام تنسيقات مثل Bold و Lists.",
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
    chatssCREENlAN: {
      searchPlaceholder: "ابحث في المحادثات",
      startChatting: "ابدأ المحادثة...",
      messageDeleted: "تم حذف الرسالة",
      photo: "📷 صورة",
      voiceMessage: "🎙 رسالة صوتية",
      online: "متصل",
      typing: "يكتب...",
      deleteChat: "حذف المحادثة",
    },
    storeScreen: {
      tabs: {
        all: "الكل",
        coinz: "كوينز",
        avatarFrame: "الإطارات",
        badge: "الشارات",
        messageEffect: "التأثيرات",
        profileEntryAnimation: "الدخول",
        gift: "الهدايا",
        bundles: "الباقات",
        limited: "محدود",
      },

      prettyType: {
        avatarFrame: "إطار الصورة",
        badge: "شارة",
        messageEffect: "تأثير الرسائل",
        gift: "هدية",
        profileEntryAnimation: "دخول الملف",
        verification: "توثيق",
        item: "عنصر",
      },

      common: {
        ok: "موافق",
        none: "لا يوجد",
        owned: "مملوك",
        active: "مفعل",
        deactivate: "إلغاء التفعيل",
        activate: "تفعيل",
        activating: "جارٍ التفعيل...",
        expired: "منتهي",
        custom: "مخصص",
        days30: "30 يومًا",
        coinz: "كوينز",
        service: "خدمة",
        oneTime: "مرة واحدة",
        cost: "التكلفة",
        insufficient: "غير كافٍ",
        create: "إنشاء",
        details: "التفاصيل",
        duration: "المدة:",
        expires: "ينتهي:",
        permanent: "دائم",
        permanentLower: "دائم",
        timed: "مؤقت",
        new: "جديد",
        bundle: "باقة",
        limited: "محدود",
        price: "السعر",
        buy: "شراء",
        img: "صورة",
        loading: "جارٍ التحميل...",
        pleaseWait: "يرجى الانتظار...",
        cancel: "إلغاء",
        close: "إغلاق",
        info: "معلومة",
        use: "استخدام",
        applying: "جارٍ التطبيق...",
        remove: "إزالة",
        add: "إضافة",
        yourBalance: "رصيدك:",
        qty: "الكمية:",
        daysSuffix: "يوم",
      },

      wallet: {
        title: "المحفظة",
        subtitle: "استخدم الكوينز لفتح الإطارات والشارات والتأثيرات والمزيد.",
        buyCoinz: "شراء كوينز",
      },

      active: {
        frame: "الإطار",
        effect: "التأثير",
        entry: "الدخول",
        badges: "الشارات",
        emojiBadge: "شارة الإيموجي",
      },

      search: {
        coinz: "ابحث في باقات الكوينز...",
        store: "ابحث في عناصر المتجر...",
      },

      sections: {
        coinzPacks: "باقات الكوينز",
        store: "المتجر",
        coinzSub: "دفع آمن عبر Paymob.",
        storeSub: "اختر ما يناسبك وخصص ملفك الشخصي.",
      },

      coinzPacks: {
        p1: { title: "مبتدئ", subtitle: "100 كوينز" },
        p2: { title: "الأشهر", subtitle: "260 كوينز" },
        p3: { title: "احترافي", subtitle: "550 كوينز" },
      },

      coinz: {
        buyTitle: "شراء كوينز",
        paymentUrlMissing: "لم يتم إرجاع رابط الدفع.",
        paymentCreateFailed: "فشل إنشاء عملية الدفع",
        youGet: "ستحصل على",
        redirecting: "جارٍ التحويل...",
        buyNow: "اشتر الآن",
        redirectNote: "سيتم تحويلك إلى صفحة Paymob لإتمام الدفع.",
        redirectDetails: "سيتم تحويلك إلى صفحة Paymob لإتمام الدفع.",
      },

      customEmoji: {
        title: "شارة إيموجي مخصصة",
        cardTitle: "شارة إيموجي مخصصة",
        cardDesc: "اشترِ شارة بإيموجي خاص بك وحدد ما إذا كنت تريد تفعيلها فورًا.",
        current: "الحالي:",
        noneOwned: "أنت لم تشترِ شارة إيموجي مخصصة بعد.",
        replaceBadge: "استبدال الشارة",
        buyBadge: "شراء الشارة",
        enterEmoji: "يرجى إدخال إيموجي واحد.",
        notOwnedYet: "أنت لا تملك شارة إيموجي مخصصة بعد.",
        expiredBuyAgain: "انتهت صلاحية شارة الإيموجي الخاصة بك. يرجى الشراء مرة أخرى.",
        enterOneEmoji: "أدخل إيموجي واحد فقط. السعر:",
        emojiField: "الإيموجي",
        preview: "المعاينة",
        activateNow: "تفعيل الآن",
        saving: "جارٍ الحفظ...",
        noBadgeTitle: "لا توجد شارة إيموجي مخصصة",
        noBadgeSub: "اشترِ واحدة من البطاقة بالأعلى لاستخدامها في ملفك الشخصي.",
        ownedTitle: "شارة مخصصة",
        emojiLabel: "الإيموجي:",
      },

      createAccount: {
        title: "إنشاء حساب",
        cardTitle: "إنشاء حساب",
        cardDescPrefix: "أنشئ حسابًا جديدًا وادفع",
        cardDescSuffix: "من رصيدك.",
        detailsMessage: "بعد النجاح يمكنك نسخ اسم المستخدم وكلمة المرور.",
        usernameRequired: "اسم المستخدم مطلوب",
        passwordMin: "يجب ألا تقل كلمة المرور عن 6 أحرف",
        insufficientBalance: "رصيد الكوينز غير كافٍ",
        debitFailed: "فشل خصم الكوينز",
        registrationFailed: "فشل التسجيل",
        usernameField: "اسم المستخدم",
        passwordField: "كلمة المرور",
        usernamePlaceholder: "اسم_المستخدم",
        passwordPlaceholder: "كلمة المرور",
        creating: "جارٍ الإنشاء...",
      },

      createdAccount: {
        title: "تم إنشاء الحساب",
        copy: "نسخ",
        copying: "جارٍ النسخ...",
      },

      purchase: {
        title: "شراء",
        quantity: "الكمية",
        autoActivate: "تفعيل تلقائي",
        total: "الإجمالي",
        buying: "جارٍ الشراء...",
        confirm: "تأكيد",
      },

      inventory: {
        title: "مخزونك",
        subtitle: "قم بإدارة العناصر التي تملكها بالفعل.",
        noItemsTitle: "لا توجد عناصر بعد",
        noItemsSub: "اشترِ شيئًا من المتجر ليظهر هنا.",
      },

      empty: {
        noCoinzPacks: "لا توجد باقات كوينز",
        noItems: "لا توجد عناصر مطابقة لبحثك",
        tryKeyword: "جرّب كلمة بحث مختلفة.",
      },

      alerts: {
        storeTitle: "المتجر",
        alreadyOwnedTitle: "مملوك بالفعل",
        alreadyOwnedMessage: "أنت تملك هذا العنصر بالفعل.",
        expiredTitle: "منتهي",
        expiredItemMessage: "انتهت صلاحية هذا العنصر. يرجى التجديد أو الشراء مرة أخرى.",
        invalidItemTitle: "عنصر غير صالح",
        verificationTypeMissing: "نوع التوثيق مفقود في بيانات العنصر",
        copiedTitle: "تم النسخ",
        credentialsCopied: "تم نسخ بيانات الدخول إلى الحافظة",
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

    profileSettings: {
      headerTitle: "إعدادات الملف",
      headerSub: "تعديل سريع مع دعم الوضع الداكن",
      loading: "جارٍ تحميل بياناتك...",

      theme: {
        dark: "داكن",
        light: "فاتح",
      },

      actions: {
        save: "حفظ",
        saving: "جارٍ...",
        back: "رجوع",
      },

      quickSummary: {
        title: "ملخص سريع",
        subtitle: "مظهر مصغر بعد التعديلات",
      },

      basic: {
        title: "البيانات الأساسية",
        subtitle: "اسم العرض، المستخدم، الموقع",
        readOnly: "غير قابل للتعديل",
        fields: {
          displayName: "اسم العرض",
          username: "اسم المستخدم",
          city: "المدينة",
          country: "الدولة",
          bio: "النبذة",
        },
        placeholders: {
          displayName: "أدخل اسم العرض",
          username: "@username",
          city: "أدخل المدينة",
          country: "أدخل الدولة",
          bio: "اكتب نبذة قصيرة عنك",
        },
      },

      media: {
        title: "الوسائط",
        subtitle: "تحكم سريع في عرض الوسائط",
        allowMedia: {
          title: "السماح بعرض الوسائط",
          subtitle: "التحكم في ظهور الشبكة داخل البروفايل.",
        },
      },

      partner: {
        title: "تفضيلات شريك الحياة",
        subtitle: "حقول اختيارية",
        fields: {
          ageRange: "العمر المناسب",
          location: "المكان",
          maritalStatus: "الحالة الاجتماعية",
          religiosity: "الالتزام",
        },
        placeholders: {
          ageRange: "مثال: 25 - 32",
          location: "المدينة أو الدولة",
          maritalStatus: "مثال: أعزب",
          religiosity: "مثال: ملتزم",
        },
      },

      interests: {
        title: "الاهتمامات",
        subtitle: "اختر وسوم تظهر في صفحتك",
      },

      tags: {
        calm: "هدوء",
        respect: "احترام",
        reading: "قراءة",
        education: "تعليم",
        lightSports: "رياضة خفيفة",
        familyLife: "حياة أسرية",
        travel: "سفر",
        volunteering: "تطوع",
      },

      privacy: {
        title: "الخصوصية",
        subtitle: "تحكم في الظهور والمراسلات",

        profileVisible: {
          title: "إظهار الملف للآخرين",
          subtitle: "عند الإيقاف يظهر الملف بشكل محدود.",
        },
        lastActive: {
          title: "إظهار آخر ظهور",
          subtitle: "إخفاء “نشط منذ …”.",
        },
        allowMessages: {
          title: "السماح بالرسائل",
          subtitle: "من يمكنه بدء محادثة معك.",
        },
      },

      notifications: {
        title: "الإشعارات",
        subtitle: "الرسائل، الإعجابات، المتابعة",

        messages: {
          title: "إشعارات الرسائل",
          subtitle: "تنبيه عند وصول رسالة.",
        },
        likes: {
          title: "إشعارات الإعجاب",
          subtitle: "تنبيه عند إعجاب.",
        },
        follows: {
          title: "إشعارات المتابعة",
          subtitle: "تنبيه عند متابعة.",
        },
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
      title: "خطوة واحدة تفصلك",
      subtitle: "انضم لعالمك الجديد",
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
      title: "اشتقنا لك",
      subtitle: "كل شيء ينتظرك هنا",
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
    notifications: {
      title: "الإشعارات",
      all: "الكل",
      unread: "غير مقروء",
      requests: "الطلبات",
      read: "مقروء",
      delete: "حذف",
      emptyTitle: "لا توجد إشعارات",
      emptySub: "سيظهر هنا كل جديد يحدث في حسابك.",
      unknownUser: "مستخدم",
      others: "آخرين",
      newNotification: "إشعار جديد",
      dash: "—",

      types: {
        tweet_like: "أُعجب بمنشورك",
        tweet_reply: "رد على منشورك",
        follow: "بدأ يتابعك",
        friend_request: "أرسل طلب صداقة",
        message: "أرسل رسالة",
        room_invite: "دعوة لغرفة",
        default: "إشعار جديد",
      },
    },
    suggestedFriends: {
      title: "الأصدقاء المقترحون",
      subtitle: "أشخاص مناسبون للإضافة والتواصل",
      loading: "جارٍ تحميل المقترحات...",
      emptyTitle: "لا توجد اقتراحات الآن",
      emptyText: "أضف مدينتك واهتماماتك لتحصل على اقتراحات أفضل",

      online: "متصل",

      add: "إضافة",
      cancelRequest: "إلغاء الطلب",
      pendingYou: "بانتظارك",
      friends: "أصدقاء",
      blocked: "محظور",
      blockedYou: "حظرك",
    },
    addFriend: {
      title: "إضافة أصدقاء",
      subtitle: "ابحث ثم أرسل طلب أو ابدأ دردشة",
      searchPlaceholder: "ابحث عن مستخدمين...",
      noUsersFound: "لا يوجد مستخدمون",

      add: "إضافة",
      cancel: "إلغاء",
      pending: "قيد الانتظار",
      friends: "أصدقاء",
      blocked: "محظور",
      blockedYou: "حظرك",
      online: "متصل",
    },
    profileScreenLan: {
      verified: "موثّق",
      activeNow: "نشط الآن",
      offline: "غير متصل",
      unspecified: "غير محدد",

      message: "رسالة",
      startChat: "بدء محادثة",
      startChatNow: "بدء الآن",
      typeFirstMessage: "اكتب أول رسالة…",
      close: "إغلاق",

      add: "إضافة",
      friends: "الأصدقاء",
      cancel: "إلغاء",
      pending: "قيد الانتظار",
      unblock: "فك الحظر",
      blockedYou: "حظرك",

      follow: "متابعة",
      following: "يتابع",

      followers: "متابعون",
      followingCount: "يتابع",
      likes: "إعجابات",
      views: "مشاهدات",

      noBioYet: "لا توجد نبذة بعد.",
      about: "حول",
      posts: "منشورات",
      media: "وسائط",

      basicInfo: "البيانات الأساسية",
      username: "اسم المستخدم",
      country: "الدولة",

      noPostsYet: "لا توجد منشورات بعد",
      postsApiHint: "هذا القسم سيعرض منشورات المستخدم عند ربطه بواجهة API.",
      mediaLabel: "وسائط",
      mediaPrivacyHint: "يتم التحكم في عرض الوسائط وفق إعدادات الخصوصية.",

      footerNote:
        "تواصل محترم فقط. أي إساءة أو طلب غير لائق يتم الإبلاغ عنه وحظر الحساب وفق سياسة المنصة.",

      loadingProfile: "جاري تحميل الملف…",
      profileLoadFailed: "تعذر تحميل الملف الشخصي",
      retry: "إعادة المحاولة",
      noData: "لا توجد بيانات للعرض",

      friendSheetAcceptedTitle: "صديق بالفعل",
      friendSheetAcceptedSub: "أنتما أصدقاء.",
      friendSheetPendingSentTitle: "إلغاء طلب الصداقة؟",
      friendSheetPendingSentSub: "سيتم إلغاء الطلب المرسل.",
      friendSheetPendingReceivedTitle: "طلب صداقة وارد",
      friendSheetPendingReceivedSub: "الطلب بانتظار قبولك.",
      friendSheetBlockedByMeTitle: "فك الحظر",
      friendSheetBlockedByMeSub: "سيتم فك الحظر عن هذا الحساب.",
      friendSheetBlockedMeTitle: "هذا الحساب حظرك",
      friendSheetBlockedMeSub: "لا يمكنك إرسال طلب صداقة.",
      friendSheetAddTitle: "إضافة صديق",
      friendSheetAddSub: "سيتم إرسال طلب صداقة إلى هذا الحساب.",

      followSheetFollowingTitle: "إلغاء المتابعة؟",
      followSheetFollowTitle: "متابعة الحساب",
      followSheetBlockedSub: "لا يمكنك المتابعة لأن هذا الحساب قام بحظرك.",
      followSheetFollowingSub: "لن ترى تحديثات هذا الحساب في المتابعة.",
      followSheetFollowSub: "ستصلك تحديثات هذا الحساب حسب إعداداتك.",

      blockSheetBlockedTitle: "محظور",
      blockSheetUnblockTitle: "فك الحظر",
      blockSheetBlockTitle: "حظر الحساب",
      blockSheetBlockedMeSub: "لا يمكنك التحكم في الحظر لأن هذا الحساب قام بحظرك.",
      blockSheetUnblockSub: "سيصبح بإمكان هذا الحساب التفاعل معك حسب الإعدادات.",
      blockSheetBlockSub: "لن يتمكن هذا الحساب من مراسلتك أو التفاعل معك.",
      blockNoteBlockedMe: "هذا الحساب قام بحظرك، لذلك لا يمكنك إرسال رسائل أو طلبات.",
      blockNoteUnblock: "أنت على وشك فك الحظر.",
      blockNoteBlock: "الحظر إجراء قوي لحماية خصوصيتك.",
      confirmBlock: "تأكيد الحظر",

      reportTitle: "إبلاغ عن الحساب",
      reportSub: "اختر سبب الإبلاغ وأضف تفاصيل إن لزم. سيتم التعامل بسرية.",
      reportReason: "سبب الإبلاغ",
      reportDetails: "تفاصيل إضافية (اختياري)",
      send: "إرسال",

      shareTitle: "مشاركة الملف",
      shareSub: "اختر طريقة المشاركة أو نسخ رابط الملف.",
      copyLink: "نسخ الرابط",
      copyLinkSub: "نسخ رابط الملف الشخصي إلى الحافظة.",
      sendToFriend: "إرسال إلى صديق",
      sendToFriendSub: "اختر محادثة لإرسال الرابط.",

      editBioTitle: "تعديل النبذة",
      editBioSub: "هذه نافذة UI فقط. اربطها لاحقًا بـ /me/settings.",
      writeNewBio: "اكتب نبذة جديدة…",
      save: "حفظ",

      tagTitle: "اهتمام / وسم",
      tagSub: "مثال تفاعلي.",
      similarProfiles: "عرض ملفات مشابهة",
      similarProfilesSub: "اقتراحات حسب هذا الوسم.",
      saveInterest: "حفظ كاهتمام",
      saveInterestSub: "إضافة هذا الوسم لاهتماماتك.",

      mediaSheetTitle: "الوسائط",
      mediaSheetSub: "عرض الوسائط يعتمد على الخصوصية.",
      mediaSheetNote: "لعرض الوسائط فعليًا: اربط Grid ببيانات الصور وافتح شاشة Viewer.",

      moreTitle: "خيارات إضافية",
      moreSub: "إجراءات سريعة على الحساب.",
      messaging: "مراسلة",
      messagingSub: "بدء محادثة مباشرة.",
      friendship: "صداقة",
      friendshipSub: "إضافة/إلغاء طلب/عرض الحالة.",
      reportAction: "إبلاغ",
      reportActionSub: "الإبلاغ عن سلوك غير مناسب.",
      blockActionSub: "منع التفاعل معك.",

      cannotMessageBlockedByThem: "لا يمكنك مراسلة هذا الحساب لأنه قام بحظرك.",
      cannotMessageBlockedByMe: "لا يمكنك مراسلة هذا الحساب لأنه محظور من طرفك.",
      messageWillSendTo: "سيتم إرسال رسالة إلى {{name}}",
      cannotCommunicate: "لا يمكنك التواصل مع هذا الحساب.",
      unblockFirstToMessage: "قم بفك الحظر أولاً لإرسال رسالة.",
    },
    storyCreate: {
      title: "إضافة حالة",

      textTab: "نص",
      imageTab: "صورة",
      videoTab: "فيديو",

      privacy: "الخصوصية",
      followers: "الأصدقاء",
      public: "عام",
      private: "خاص",

      storyText: "نص الحالة",
      storyTextPlaceholder: "اكتب حالتك...",

      imageFile: "ملف الصورة",
      videoFile: "ملف الفيديو",
      chooseFromDevice: "اختر من جهازك",
      changeFile: "تغيير الملف",
      optionalComment: "تعليق (اختياري)",
      commentPlaceholder: "اكتب تعليق...",

      size: "الحجم",
      uploaded: "تم الرفع",

      preparingImage: "تجهيز الصورة...",
      preparingVideo: "تجهيز الفيديو...",
      videoCompressedUploading: "تم ضغط الفيديو - جاري الرفع...",
      videoNotCompressedUploading: "لم يتم الضغط - جاري الرفع...",
      uploadingImage: "رفع الصورة...",
      uploadSuccess: "تم الرفع بنجاح ✓",

      waitTitle: "انتظار",
      waitMessage: "يرجى انتظار اكتمال رفع الملف.",
      missingDataTitle: "نقص بيانات",
      missingTextMessage: "اكتب نص الحالة.",
      missingFileMessage: "اختر ملفًا.",
      permissionTitle: "صلاحيات",
      permissionMessage: "يجب منح صلاحية الوصول للصور/الفيديو.",
      operationFailed: "فشل العملية",
      genericError: "حدث خطأ.",
      noFileSelected: "لا يوجد ملف محدد.",
      uploadFailed: "حدث خطأ أثناء رفع الملف.",
      uploadParseFailed: "فشل قراءة استجابة الرفع.",
      networkUploadError: "خطأ شبكة أثناء الرفع.",

      publishLoading: "جاري النشر...",
      uploadLoading: "جاري الرفع...",
      publishStory: "نشر الحالة",

      noteStoriesLimit:
        "* الباك يمنع إضافة أكثر من حالتين نشطتين. إذا حذفت حالة يمكنك إضافة أخرى.",
      noteVideoCompression:
        "* ضغط الفيديو يعمل فقط في Bare أو Expo Dev Client (وليس Expo Go).",
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
      post: "نشر",
      postNotAvailable: "المنشور غير متاح",
      noRepliesYet: "لا توجد ردود بعد",
      beFirstReply: "كن أول من يرد.",
      postYourReply: "اكتب ردك",
      deletePost: "حذف المنشور",
      report: "إبلاغ",
      share: "مشاركة",
      bookmark: "حفظ",
      removeBookmark: "إزالة من المحفوظات",
      relevantReplies: "الردود الأكثر صلة",
    }
  },
};
