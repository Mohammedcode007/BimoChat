import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ReportReason } from "@/redux/slices/reportSlice";
import { REPORT_REASON_OPTIONS } from "./constants";
import { ReportTarget, SheetMode } from "./types";

type TweetOptionsSheetProps = {
  visible: boolean;
  s: any;
  theme: any;
  isDark: boolean;
  t: any;

  sheetMode: SheetMode;
  selectedUser: any;
  selectedTweet: any;
  selectedUserIsMe: boolean;
  selectedUserIsFollowing: boolean;
  isAdmin: boolean;
  currentUser: any;

  actionLoading: string | null;
  reportSubmitting: boolean;

  reportTarget: ReportTarget | null;
  selectedReason: ReportReason | null;
  reportDetails: string;

  onClose: () => void;
  onViewTweet: () => void;
  onToggleFollow: () => void | Promise<void>;
  onToggleBlock: () => void | Promise<void>;
  onDeleteTweet: () => void | Promise<void>;

  onOpenReport: (target: ReportTarget) => void;
  onBackToMenu: () => void;
  onSelectReason: (reason: ReportReason) => void;
  onChangeReportDetails: (text: string) => void;
  onSubmitReport: () => void | Promise<void>;
};

export function TweetOptionsSheet({
  visible,
  s,
  theme,
  isDark,
  t,
  sheetMode,
  selectedUser,
  selectedTweet,
  selectedUserIsMe,
  selectedUserIsFollowing,
  isAdmin,
  currentUser,
  actionLoading,
  reportSubmitting,
  reportTarget,
  selectedReason,
  reportDetails,
  onClose,
  onViewTweet,
  onToggleFollow,
  onToggleBlock,
  onDeleteTweet,
  onOpenReport,
  onBackToMenu,
  onSelectReason,
  onChangeReportDetails,
  onSubmitReport,
}: TweetOptionsSheetProps) {
  if (!visible) return null;

  return (
    <View style={s.overlay}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={s.sheet}>
        {sheetMode === "menu" ? (
          <>
            {selectedUser && (
              <>
                <Text style={s.sheetTitle}>
                  {selectedUser.atUsername?.startsWith("@")
                    ? selectedUser.atUsername
                    : `@${selectedUser.atUsername}`}
                </Text>

                <TouchableOpacity
                  style={s.sheetItem}
                  activeOpacity={0.9}
                  onPress={onViewTweet}
                >
                  <View
                    style={[
                      s.sheetIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(79,70,229,0.14)"
                          : "rgba(79,70,229,0.10)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={18}
                      color="#4F46E5"
                    />
                  </View>

                  <Text style={s.sheetText}>
                    {t("tweetsScreen.viewPost") || "عرض المنشور"}
                  </Text>
                </TouchableOpacity>

                {!selectedUserIsMe && (
                  <TouchableOpacity
                    style={s.sheetItem}
                    onPress={onToggleFollow}
                    activeOpacity={0.9}
                  >
                    <View
                      style={[
                        s.sheetIcon,
                        {
                          backgroundColor: selectedUserIsFollowing
                            ? isDark
                              ? "rgba(239,68,68,0.12)"
                              : "rgba(239,68,68,0.10)"
                            : isDark
                              ? "rgba(79,70,229,0.14)"
                              : "rgba(79,70,229,0.10)",
                        },
                      ]}
                    >
                      {actionLoading === `sheet-follow-${selectedUser?._id}` ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            selectedUserIsFollowing ? "#EF4444" : "#4F46E5"
                          }
                        />
                      ) : (
                        <Ionicons
                          name={
                            selectedUserIsFollowing
                              ? "person-remove-outline"
                              : "person-add-outline"
                          }
                          size={18}
                          color={
                            selectedUserIsFollowing ? "#EF4444" : "#4F46E5"
                          }
                        />
                      )}
                    </View>

                    <Text style={s.sheetText}>
                      {selectedUserIsFollowing
                        ? t("tweetsScreen.unfollow") || "إلغاء المتابعة"
                        : t("tweetsScreen.follow") || "متابعة"}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={s.sheetItem}
                  activeOpacity={0.9}
                  onPress={onToggleBlock}
                >
                  <View
                    style={[
                      s.sheetIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(239,68,68,0.10)",
                      },
                    ]}
                  >
                    {actionLoading === `block-${selectedUser?._id}` ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons
                        name={
                          selectedUser?.relationshipStatus === "blocked_by_me"
                            ? "lock-open-outline"
                            : "ban-outline"
                        }
                        size={18}
                        color="#EF4444"
                      />
                    )}
                  </View>

                  <Text style={s.sheetText}>
                    {selectedUser?.relationshipStatus === "blocked_by_me"
                      ? "إلغاء الحظر"
                      : t("tweetsScreen.block")}
                  </Text>
                </TouchableOpacity>

                {!!selectedTweet?._id && (
                  <TouchableOpacity
                    style={s.sheetItem}
                    activeOpacity={0.9}
                    onPress={() =>
                      onOpenReport({
                        targetType: "tweet",
                        targetId: selectedTweet._id,
                        label: "تويت",
                      })
                    }
                  >
                    <View
                      style={[
                        s.sheetIcon,
                        {
                          backgroundColor: isDark
                            ? "rgba(245,158,11,0.14)"
                            : "rgba(245,158,11,0.10)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="flag-outline"
                        size={18}
                        color="#F59E0B"
                      />
                    </View>

                    <Text style={s.sheetText}>بلاغ عن التويتة</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={s.sheetItem}
                  activeOpacity={0.9}
                  onPress={() =>
                    onOpenReport({
                      targetType: "user",
                      targetId: selectedUser._id,
                      label: selectedUser.atUsername,
                    })
                  }
                >
                  <View
                    style={[
                      s.sheetIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(245,158,11,0.14)"
                          : "rgba(245,158,11,0.10)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="flag-outline"
                      size={18}
                      color="#F59E0B"
                    />
                  </View>

                  <Text style={s.sheetText}>بلاغ عن المستخدم</Text>
                </TouchableOpacity>

                {(isAdmin || selectedTweet?.author?._id === currentUser?._id) &&
                  !!selectedTweet?._id && (
                    <TouchableOpacity
                      style={s.sheetItem}
                      activeOpacity={0.9}
                      onPress={onDeleteTweet}
                    >
                      <View
                        style={[
                          s.sheetIcon,
                          {
                            backgroundColor: isDark
                              ? "rgba(239,68,68,0.12)"
                              : "rgba(239,68,68,0.10)",
                          },
                        ]}
                      >
                        {actionLoading === `delete-${selectedTweet?._id}` ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#EF4444"
                          />
                        )}
                      </View>

                      <Text style={s.sheetText}>حذف التويتة</Text>
                    </TouchableOpacity>
                  )}
              </>
            )}
          </>
        ) : (
          <>
            <View style={s.reportHeaderRow}>
              <TouchableOpacity
                onPress={onBackToMenu}
                activeOpacity={0.85}
                style={s.reportBackBtn}
              >
                <Ionicons name="chevron-back" size={20} color={theme.text} />
              </TouchableOpacity>

              <Text style={s.reportTitle}>إرسال بلاغ</Text>

              <View style={{ width: 36 }} />
            </View>

            {!!reportTarget?.label && (
              <Text style={s.reportSubtitle}>
                الهدف: {reportTarget.label}
              </Text>
            )}

            <Text style={s.reportSectionTitle}>اختر السبب</Text>

            <View style={s.reportReasonsWrap}>
              {REPORT_REASON_OPTIONS.map((reasonItem) => {
                const active = selectedReason === reasonItem.value;

                return (
                  <TouchableOpacity
                    key={reasonItem.value}
                    activeOpacity={0.9}
                    onPress={() => onSelectReason(reasonItem.value)}
                    style={[
                      s.reportReasonChip,
                      active && s.reportReasonChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        s.reportReasonText,
                        active && s.reportReasonTextActive,
                      ]}
                    >
                      {reasonItem.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.reportSectionTitle}>تفاصيل إضافية</Text>

            <TextInput
              value={reportDetails}
              onChangeText={onChangeReportDetails}
              placeholder="اكتب تفاصيل البلاغ هنا"
              placeholderTextColor={theme.mutedText}
              multiline
              style={s.reportInput}
              textAlignVertical="top"
              maxLength={1000}
            />

            <View style={s.reportActionsRow}>
              <TouchableOpacity
                style={s.reportCancelBtn}
                onPress={onBackToMenu}
                activeOpacity={0.9}
                disabled={reportSubmitting}
              >
                <Text style={s.reportCancelText}>رجوع</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.reportSubmitBtn}
                onPress={onSubmitReport}
                activeOpacity={0.9}
                disabled={reportSubmitting}
              >
                {reportSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={s.reportSubmitText}>إرسال البلاغ</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}