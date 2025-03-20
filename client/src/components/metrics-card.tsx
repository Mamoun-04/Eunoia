
import { Card, CardContent } from "./ui/card";
import { Award, Book, Clock, PenSquare } from "lucide-react";
import { motion } from "framer-motion";

type MetricProps = {
  icon: JSX.Element;
  label: string;
  value: string | number;
  subtitle: string;
  onClick?: () => void;
};

export function MetricCard({ icon, label, value, subtitle, onClick }: MetricProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center sm:items-start gap-3 sm:justify-between">
            <div className="flex items-center sm:items-start gap-3 sm:flex-col sm:space-y-2">
              <div className="text-primary order-first sm:order-last">{icon}</div>
              <div className="flex flex-col sm:space-y-2">
                <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
                <div className="text-2xl sm:text-3xl font-bold font-[Helvetica]">{value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{subtitle}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
