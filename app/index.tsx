import UIText from "@/components/ui/UIText";
import UIView from "@/components/ui/UIView";
import ThemeSwitch from "@/theme/ThemeSwitch";

export default function Index() {
  return (
    <UIView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <UIText>Hei</UIText>

      <ThemeSwitch />
    </UIView>
  );
}
