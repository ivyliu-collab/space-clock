

## Plan: Transpose Weekly Stats Chart to Vertical Bars

**Goal:** Convert the current horizontal bar chart (rows = days, horizontal axis = time of day) into a vertical/column chart (columns = days on X-axis, vertical axis = time of day), keeping all existing logic and styling intact.

### Current vs Target Layout

```text
CURRENT (horizontal):
     一 ████████████
     二 ██████████████
     三 ████████
     四 ██████████████████
     五

TARGET (vertical/transposed):
     |  ██          ██
     |  ██  ██      ██
     |  ██  ██  ██  ██
     |  ██  ██  ██  ██
     -------------------------
      一  二  三  四  五
```

### Changes (single file: `src/components/WeeklyStats.tsx`)

1. **Container layout**: Change the chart from `flex-col gap-3` (stacked rows) to a horizontal `flex flex-row` with equal-width columns for Mon–Fri.

2. **Each day column**: Render vertically with:
   - Day label ("一"–"五") at bottom
   - A tall container (e.g., `h-32`) with `relative` positioning
   - Goal range bar and actual range bar positioned using `bottom`/`height` percentages instead of `left`/`width`
   - The `toPercent` function remains the same but values apply to vertical axis

3. **Time markers**: Move to the left side as Y-axis labels (goal start/end times).

4. **Vertical axis direction**: Bottom = early time (e.g., 09:00), Top = late time (e.g., 20:00). This maps naturally since `bottom: X%` pushes upward.

5. **All calculation logic** (`weekAvg`, `weeklyRemainingMsg`, `dailyIntervals`, `leaveMap`, etc.) stays completely unchanged.

6. **Animations**: Change `scaleX` to `scaleY` with `transformOrigin: "bottom"`.

7. **Sleeping cat empty state**: No changes needed.

