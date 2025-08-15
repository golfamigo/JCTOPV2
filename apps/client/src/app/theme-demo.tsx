import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  Input,
  Card,
  ListItem,
  Avatar,
  Badge,
  CheckBox,
  Divider,
  SearchBar,
  Switch,
  Icon,
  Header,
} from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../theme';

export default function ThemeDemoScreen() {
  const { colors, typography, spacing } = useAppTheme();
  const [searchText, setSearchText] = useState('');
  const [checked, setChecked] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);

  const colorSwatches = [
    { name: '主色 (Primary)', color: colors.primary },
    { name: '白色 (White)', color: colors.white },
    { name: '淺灰 (Light Grey)', color: colors.lightGrey },
    { name: '中灰 (Mid Grey)', color: colors.midGrey },
    { name: '深色 (Dark)', color: colors.dark },
    { name: '成功 (Success)', color: colors.success },
    { name: '危險 (Danger)', color: colors.danger },
    { name: '警告 (Warning)', color: colors.warning },
  ];

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: '主題示範 (Theme Demo)', style: { color: 'white' } }}
        rightComponent={{ icon: 'palette', color: 'white' }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Color Palette Section */}
        <Card>
          <Text h2 style={[typography.h2, { marginBottom: spacing.md }]}>
            色彩方案 (Color Palette)
          </Text>
          <View style={styles.colorGrid}>
            {colorSwatches.map((swatch, index) => (
              <View key={index} style={styles.colorSwatch}>
                <View
                  style={[
                    styles.colorBox,
                    { backgroundColor: swatch.color },
                    swatch.color === colors.white && { borderWidth: 1, borderColor: colors.border }
                  ]}
                />
                <Text style={[typography.small, { textAlign: 'center', marginTop: spacing.xs }]}>
                  {swatch.name}
                </Text>
                <Text style={[typography.small, { textAlign: 'center', color: colors.textSecondary }]}>
                  {swatch.color}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Typography Section */}
        <Card>
          <Text h2 style={[typography.h2, { marginBottom: spacing.md }]}>
            字體排印 (Typography)
          </Text>
          <Text h1 style={{ marginBottom: spacing.sm }}>
            大標題 H1 (24pt, Bold)
          </Text>
          <Text h2 style={{ marginBottom: spacing.sm }}>
            次標題 H2 (20pt, Bold)
          </Text>
          <Text h3 style={{ marginBottom: spacing.sm }}>
            子標題 H3 (18pt, Semi-bold)
          </Text>
          <Text style={[typography.body, { marginBottom: spacing.sm }]}>
            內文 Body (16pt, Regular) - 這是標準內文字體，適用於大部分內容。
          </Text>
          <Text style={typography.small}>
            小字 Small (14pt, Regular) - 用於輔助資訊和說明文字。
          </Text>
        </Card>

        {/* Spacing System Section */}
        <Card>
          <Text h2 style={[typography.h2, { marginBottom: spacing.md }]}>
            間距系統 (Spacing System - 8pt Grid)
          </Text>
          {Object.entries(spacing).map(([name, value]) => (
            <View key={name} style={styles.spacingDemo}>
              <Text style={typography.body}>{name.toUpperCase()}: {value}pt</Text>
              <View style={[styles.spacingBar, { width: value * 2, backgroundColor: colors.primary }]} />
            </View>
          ))}
        </Card>

        {/* UI Components Section */}
        <Card>
          <Text h2 style={[typography.h2, { marginBottom: spacing.md }]}>
            UI 元件示範 (UI Components)
          </Text>
          
          {/* Buttons */}
          <View style={styles.componentSection}>
            <Text h4 style={{ marginBottom: spacing.sm }}>按鈕 (Buttons)</Text>
            <View style={styles.buttonRow}>
              <Button title="主要按鈕" buttonStyle={{ marginRight: spacing.sm }} />
              <Button title="次要按鈕" type="outline" />
            </View>
            <View style={[styles.buttonRow, { marginTop: spacing.sm }]}>
              <Button title="成功" color="success" size="sm" />
              <Button title="警告" color="warning" size="sm" />
              <Button title="危險" color="error" size="sm" />
            </View>
          </View>

          {/* Inputs */}
          <View style={styles.componentSection}>
            <Text h4 style={{ marginBottom: spacing.sm }}>輸入框 (Inputs)</Text>
            <Input
              placeholder="請輸入姓名"
              label="姓名"
              leftIcon={{ type: 'material', name: 'person' }}
            />
            <Input
              placeholder="請輸入電子信箱"
              label="電子信箱"
              leftIcon={{ type: 'material', name: 'email' }}
              keyboardType="email-address"
            />
          </View>

          {/* Search Bar */}
          <View style={styles.componentSection}>
            <Text h4 style={{ marginBottom: spacing.sm }}>搜尋欄 (Search Bar)</Text>
            <SearchBar
              placeholder="搜尋活動..."
              onChangeText={setSearchText}
              value={searchText}
              platform="default"
            />
          </View>

          {/* List Items */}
          <View style={styles.componentSection}>
            <Text h4 style={{ marginBottom: spacing.sm }}>列表項目 (List Items)</Text>
            <ListItem bottomDivider>
              <Avatar
                source={{ uri: 'https://via.placeholder.com/40' }}
                rounded
              />
              <ListItem.Content>
                <ListItem.Title>張小明</ListItem.Title>
                <ListItem.Subtitle>活動主辦人</ListItem.Subtitle>
              </ListItem.Content>
              <Badge value="新" status="success" />
            </ListItem>
            <ListItem bottomDivider>
              <Icon name="event" type="material" />
              <ListItem.Content>
                <ListItem.Title>年終聚餐活動</ListItem.Title>
                <ListItem.Subtitle>2025年1月15日</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>

          {/* Form Controls */}
          <View style={styles.componentSection}>
            <Text h4 style={{ marginBottom: spacing.sm }}>表單控制項 (Form Controls)</Text>
            <CheckBox
              title="我同意服務條款"
              checked={checked}
              onPress={() => setChecked(!checked)}
            />
            <View style={styles.switchRow}>
              <Text style={typography.body}>啟用通知</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
              />
            </View>
          </View>

          {/* Badges */}
          <View style={styles.componentSection}>
            <Text h4 style={{ marginBottom: spacing.sm }}>徽章 (Badges)</Text>
            <View style={styles.badgeRow}>
              <Badge value="已報名" status="success" />
              <Badge value="進行中" status="warning" />
              <Badge value="已結束" status="error" />
              <Badge value="99+" />
            </View>
          </View>
        </Card>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorSwatch: {
    width: '22%',
    marginBottom: 16,
    alignItems: 'center',
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  spacingDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  spacingBar: {
    height: 4,
    borderRadius: 2,
  },
  componentSection: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});