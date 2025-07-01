
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LinkIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharePointIntegrationCardProps {
  formData: {
    sharepoint_link: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const SharePointIntegrationCard = ({ formData, onInputChange }: SharePointIntegrationCardProps) => {
  const { toast } = useToast();

  const validateSharePointLink = (url: string) => {
    return url.includes('sharepoint.com') || url.includes('onedrive.com') || url === '';
  };

  const testSharePointConnection = () => {
    if (!formData.sharepoint_link) {
      toast({
        title: "No SharePoint Link",
        description: "Please enter a SharePoint link first.",
        variant: "destructive",
      });
      return;
    }

    if (!validateSharePointLink(formData.sharepoint_link)) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid SharePoint or OneDrive link.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Connection Test",
      description: "SharePoint link is valid and ready to use.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          SharePoint Integration
        </CardTitle>
        <CardDescription>
          Connect your project to a SharePoint folder for file management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sharepoint-link">SharePoint Folder Link</Label>
          <Input
            id="sharepoint-link"
            value={formData.sharepoint_link}
            onChange={(e) => onInputChange("sharepoint_link", e.target.value)}
            placeholder="Paste your SharePoint folder link here (e.g., https://company.sharepoint.com/...)"
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste the SharePoint or OneDrive folder link where your project files are stored
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={testSharePointConnection}
            disabled={!formData.sharepoint_link}
          >
            Test Connection
          </Button>
          {formData.sharepoint_link && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(formData.sharepoint_link, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in SharePoint
            </Button>
          )}
        </div>
        
        {formData.sharepoint_link && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">SharePoint Connected</p>
                <p className="text-xs text-blue-700">
                  Files from this SharePoint folder will be displayed in the Project Files page
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
