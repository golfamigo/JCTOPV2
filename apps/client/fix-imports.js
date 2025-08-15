const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/organizer/EventAnalyticsScreen.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/organizer/ManualCheckInButton.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/organizer/CameraScanner.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/organizer/ReportVisualization.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/organizer/CheckInStatisticsHeader.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/DiscountCodeCard.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/TicketConfiguration.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/EventManagement.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/EventStatusManager.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/DiscountCodeList.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/EventCreateFormMultiStep.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/SeatingConfiguration.tsx',
  '/home/golfamigo/projects/JCTOPV2/apps/client/src/components/features/event/DiscountCodeForm.tsx',
];

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix pattern where we have a comma followed by import on next line without closing brace
    // This regex matches: word or comma, newline(s), then "import {"
    content = content.replace(/(\w+,?)\s*\nimport\s+\{/g, '$1\n} from \'@rneui/themed\';\nimport { MaterialIcons } from \'@expo/vector-icons\';\nimport {');
    
    // Remove duplicate imports if they were created
    const lines = content.split('\n');
    const seen = new Set();
    const filtered = [];
    
    for (const line of lines) {
      if (line.includes('from \'@rneui/themed\'') || line.includes('from \'@expo/vector-icons\'')) {
        if (!seen.has(line)) {
          seen.add(line);
          filtered.push(line);
        }
      } else {
        filtered.push(line);
      }
    }
    
    fs.writeFileSync(filePath, filtered.join('\n'));
    console.log(`Fixed: ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err.message);
  }
});

console.log('Import fixes completed!');