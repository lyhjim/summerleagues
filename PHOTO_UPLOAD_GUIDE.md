# 決賽照片上傳指南 (Finals Player Photos Upload Guide)

## 上傳方式 (Upload Methods)

### 方法 1: 使用管理員面板 (Admin Panel - Recommended)

1. **登入管理員面板**
   - 訪問: `http://localhost:3000/admin/lineup-links`
   - 輸入管理員密碼

2. **進入「決賽照片上傳」分頁**
   - 點擊頂部的「決賽照片上傳」選項卡

3. **為每位選手上傳照片**
   - 選擇相應的比賽 (Game 37-40) 和座位 (東/南/西/北)
   - 點擊「上傳照片」按鈕
   - 輸入照片URL或從已上傳的照片中選擇
   - 選擇性輸入選手名稱
   - 點擊「保存」

### 方法 2: 使用API直接上傳 (Direct API Upload)

如果您有系統外的圖片存儲，可以使用API直接上傳:

```bash
curl -X POST http://localhost:3000/api/admin/finals-photos \
  -H "Content-Type: application/json" \
  -d '{
    "game_number": 37,
    "seat": "東",
    "team_name": "雙狙人",
    "player_name": "選手名稱",
    "photo_url": "https://example.com/photo.jpg"
  }'
```

## 照片格式要求 (Photo Requirements)

- **格式**: JPG, PNG, WebP
- **大小**: 推薦 200x200 ~ 500x500 像素
- **寬度**: 最少 100 像素
- **高度**: 最少 100 像素
- **檔案大小**: 推薦 < 500KB

## URL存儲選項 (URL Storage Options)

照片必須通過URL訪問。以下是幾種上傳選項:

### 選項 1: 使用免費圖片托管服務
- **Imgur**: https://imgur.com (支持直接上傳，得到永久URL)
- **imgbox**: https://imgbox.com
- **Postimages**: https://postimages.org

### 選項 2: 使用雲存儲服務
- **Google Drive**: 分享文件，復制共享URL
- **Dropbox**: 生成公開分享鏈接
- **AWS S3**: 設置公開存儲桶

### 選項 3: 使用項目內置Blob存儲
如果已配置Vercel Blob:
```bash
# 上傳文件到Blob存儲，然后在管理面板使用返回的URL
```

## 步驟示例 (Step-by-Step Example)

### 使用Imgur:
1. 訪問 https://imgur.com
2. 點擊「上傳圖片」
3. 選擇照片文件
4. 等待上傳完成
5. 復制圖片URL (右鍵 > 複製圖片鏈接)
   - 例如: `https://i.imgur.com/abc123.jpg`
6. 在管理面板粘貼URL並保存

### 在管理面板:
1. 登入管理員面板
2. 進入「決賽照片上傳」分頁
3. 找到 Game 37, 東位 (雙狙人)
4. 點擊「上傳照片」
5. 在URL欄粘貼: `https://i.imgur.com/abc123.jpg`
6. 可選: 輸入選手名稱
7. 點擊「保存」

## 常見問題 (FAQ)

**Q: 照片顯示不出來?**
A: 檢查以下事項:
- URL是否正確（在瀏覽器中直接訪問）
- 圖片是否為公開可訪問
- 圖片格式是否支持 (JPG, PNG, WebP)
- 檢查瀏覽器控制台是否有CORS錯誤

**Q: 如何編輯已上傳的照片?**
A: 在管理面板中，點擊已上傳照片的「編輯」按鈕，修改URL或選手名稱後保存

**Q: 可以上傳多張照片嗎?**
A: 每個座位 (Game + 座位組合) 只能存儲一張照片。如需更新，直接編輯並保存新URL

**Q: 照片在哪裡會被顯示?**
A: 照片會在以下位置顯示:
- 決賽比賽日程表 (Finals Match Schedule)
- 決賽結果顯示 (Finals Results Display) - 作為背景
- 管理面板預覽

## 數據庫結構 (Database Structure)

照片存儲在 `finals_player_photos` 表中:
- `game_number`: 比賽編號 (37-40)
- `seat`: 座位 (東/南/西/北)
- `team_name`: 隊伍名稱
- `player_name`: 選手名稱 (可選)
- `photo_url`: 圖片URL

## 技術細節 (Technical Details)

### 上傳API端點:
- **GET** `/api/admin/finals-photos` - 獲取所有決賽照片
- **POST** `/api/admin/finals-photos` - 上傳或更新照片
- **DELETE** `/api/admin/finals-photos?game_number=37&seat=東` - 刪除照片

### 前端顯示組件:
- `FinalsMatchSchedule` - 比賽日程表 (小照片)
- `FinalsResultsDisplay` - 結果顯示 (大照片背景)

## 注意事項 (Important Notes)

1. **版權**: 確保有權使用上傳的照片
2. **隱私**: 遵守隱私政策，獲得選手同意
3. **性能**: 使用適當大小的圖片以保持頁面性能
4. **備份**: 重要照片建議在多個地方保存備份
