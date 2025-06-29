
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink } from "lucide-react";

interface SharePointIntegrationProps {
  sharePointFilesCount: number;
}

export const SharePointIntegration = ({ sharePointFilesCount }: SharePointIntegrationProps) => {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Share2 className="w-5 h-5" />
          <span>SharePoint Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 mb-1">
              Connected to SharePoint folder: <strong>Construction Projects/Gordon Street</strong>
            </p>
            <p className="text-xs text-blue-600">
              {sharePointFilesCount} files synced • Last sync: Just now
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in SharePoint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
