import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { getStoreOwnerId } from "#root/shared/config/store";
import { toast } from "sonner";
import { Button } from "#root/components/ui/button";
import { Card, CardContent } from "#root/components/ui/card";
import { Label } from "#root/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Save, RotateCcw, ExternalLink, AlertCircle } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { Alert, AlertDescription } from "#root/components/ui/alert";
import { templateConfig } from "#root/components/template-system/templateConfig";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";

// ── Editor registry ────────────────────────────────────────
import { demoEditorRegistry } from "#root/components/template-system/editor-registry";
import "#root/components/template-system/register-editors"; // side-effect: populates registry (register-editors.tsx)

export default function HomepageAdminPage() {
  const pageContext = usePageContext();
  const session = pageContext.clientSession;
  const { getTemplateId } = useTemplate();

  const MERCHANT_ID = getStoreOwnerId();

  // Auto-select the currently active landing template
  const activeLandingTemplate =
    getTemplateId("landing") ??
    templateConfig.landing[0]?.id ??
    "landing-modern";

  // ── State ────────────────────────────────────────────────
  const [content, setContent] = useState<unknown>(null);
  const [originalContent, setOriginalContent] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    activeLandingTemplate,
  );
  const [legacyFallbackBanner, setLegacyFallbackBanner] = useState(false);

  // Resolve the registry entry for the selected template
  const entry = demoEditorRegistry[selectedTemplateId];

  // Check for unsaved changes whenever content changes
  useEffect(() => {
    const contentChanged =
      JSON.stringify(content) !== JSON.stringify(originalContent);
    setHasUnsavedChanges(contentChanged);
  }, [content, originalContent]);

  // Sync selected template when active template resolves from DB
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setSelectedTemplateId(activeLandingTemplate);
    }
  }, [activeLandingTemplate]);

  // Load content when template changes
  useEffect(() => {
    loadContent();
  }, [selectedTemplateId]);

  const loadContent = async () => {
    if (!entry) return;
    setIsLoading(true);
    setLegacyFallbackBanner(false);
    try {
      const result = await trpc.homepage.getContent.query({
        merchantId: MERCHANT_ID,
        templateId: selectedTemplateId,
      });

      if (result.success && result.result) {
        // Legacy-row fallback: validate returned blob against the expected schema
        const parsed = entry.contentSchema.safeParse(result.result);
        if (parsed.success) {
          setContent(parsed.data);
          setOriginalContent(parsed.data);
        } else {
          console.warn(
            `[editor-shell] Schema mismatch for ${selectedTemplateId}, loading defaults.`,
            parsed.error.issues,
          );
          setContent(entry.defaultContent);
          setOriginalContent(entry.defaultContent);
          setLegacyFallbackBanner(true);
        }
      } else {
        // No row yet — use defaults
        setContent(entry.defaultContent);
        setOriginalContent(entry.defaultContent);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Error loading homepage content");
      setContent(entry.defaultContent);
      setOriginalContent(entry.defaultContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (session && session.role !== "admin") {
      toast.error("Only administrators can update homepage content");
      return;
    }
    if (!entry || content == null) return;

    // Client-side validation via the registry's Zod schema
    const parsed = entry.contentSchema.safeParse(content);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      toast.error(
        `Validation error: ${firstIssue?.path.join(".")} — ${firstIssue?.message}`,
      );
      return;
    }

    console.log(
      "[wire-debug] INPUT to safeParse:",
      JSON.stringify((content as any)?.hero?.primaryCta ?? {}),
    );
    console.log(
      "[wire-debug] OUTPUT from safeParse:",
      JSON.stringify((parsed.data as any)?.hero?.primaryCta ?? {}),
    );

    setIsSaving(true);
    try {
      const result = await trpc.homepage.updateContent.mutate({
        merchantId: MERCHANT_ID,
        templateId: selectedTemplateId,
        content: parsed.data,
      });

      if (result.success) {
        const savedAt = new Date();
        setLastSavedAt(savedAt);
        setContent(parsed.data);
        setOriginalContent(parsed.data);
        setHasUnsavedChanges(false);
        setLegacyFallbackBanner(false);
        toast.success("Homepage content saved successfully!");
      } else {
        toast.error("Failed to save homepage content");
      }
    } catch (error: any) {
      console.error("Error saving content:", error);
      const detail =
        error?.message || error?.data?.message || JSON.stringify(error);
      toast.error(`Error saving homepage content: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!entry) return;
    if (
      confirm(
        "Are you sure you want to reset all content to defaults? This will discard all your changes.",
      )
    ) {
      setContent(entry.defaultContent);
      setOriginalContent(entry.defaultContent);
      setHasUnsavedChanges(false);
      setLastSavedAt(null);
      setLegacyFallbackBanner(false);
      toast.info("Content reset to defaults");
    }
  };

  const handlePreviewHomepage = async () => {
    if (hasUnsavedChanges) {
      await handleSave();
    }
    toast.info("Preview shows latest saved changes");
    window.open("/", "_blank");
  };

  // ── Render ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className='container mx-auto py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <p className='text-muted-foreground'>Loading homepage content...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className='container mx-auto py-8'>
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            No editor registered for template "{selectedTemplateId}".
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Homepage Content Editor</h1>
          <p className='text-muted-foreground mt-1'>
            Customize your homepage sections and content
          </p>
          {hasUnsavedChanges && (
            <div className='flex items-center gap-2 mt-2 text-amber-600'>
              <AlertCircle className='w-4 h-4' />
              <span className='text-sm font-medium'>Unsaved changes</span>
            </div>
          )}
          {lastSavedAt && !hasUnsavedChanges && (
            <p className='text-sm text-muted-foreground mt-2'>
              Last saved at{" "}
              {lastSavedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={handlePreviewHomepage}
            disabled={isSaving}>
            <ExternalLink className='w-4 h-4 mr-2' />
            Preview Homepage
          </Button>
          <Button variant='outline' onClick={handleReset} disabled={isSaving}>
            <RotateCcw className='w-4 h-4 mr-2' />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}>
            <Save className='w-4 h-4 mr-2' />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Template Selector */}
      <Card className='mb-6 border-blue-200 bg-blue-50/50'>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <Label
                htmlFor='template-selector'
                className='text-sm font-semibold text-blue-900'>
                Editing Content For Template
              </Label>
              <p className='text-xs text-blue-700 mt-0.5'>
                Each landing template has its own CMS content. Select which
                template's content you want to edit.
              </p>
            </div>
            <Select
              value={selectedTemplateId}
              onValueChange={(value) => {
                if (hasUnsavedChanges) {
                  const confirmed = confirm(
                    "You have unsaved changes. Switching templates will discard them. Continue?",
                  );
                  if (!confirmed) return;
                }
                setSelectedTemplateId(value);
                setHasUnsavedChanges(false);
                setLastSavedAt(null);
              }}>
              <SelectTrigger
                id='template-selector'
                className='w-[320px] bg-white'>
                <SelectValue placeholder='Select a template' />
              </SelectTrigger>
              <SelectContent>
                {templateConfig.landing.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                    {template.id === activeLandingTemplate ? " (Active)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!session && (
        <Alert className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            You are not logged in. Changes will be saved using the default
            merchant ID.
          </AlertDescription>
        </Alert>
      )}

      {session && session.role !== "admin" && (
        <Alert className='mb-6 border-amber-500 bg-amber-50'>
          <AlertCircle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800'>
            Only administrators can update homepage content. You can view and
            edit, but changes cannot be saved.
          </AlertDescription>
        </Alert>
      )}

      {legacyFallbackBanner && (
        <Alert className='mb-6 border-orange-300 bg-orange-50'>
          <AlertCircle className='h-4 w-4 text-orange-600' />
          <AlertDescription className='text-orange-800'>
            The saved content didn't match this template's schema and was
            replaced with defaults. Save to overwrite the old data.
          </AlertDescription>
        </Alert>
      )}

      <div className='space-y-6'>
        {/* Demo-specific panel body */}
        {content != null && (
          <entry.EditorBody
            content={content}
            onChange={(next: unknown) => setContent(next)}
            onFieldError={() => {}}
          />
        )}

        {/* Save/Reset buttons at bottom */}
        <div className='flex items-center justify-between pt-6 border-t'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' onClick={handleReset} disabled={isSaving}>
              <RotateCcw className='w-4 h-4 mr-2' />
              Reset to Defaults
            </Button>
            <Button
              variant='outline'
              onClick={handlePreviewHomepage}
              disabled={isSaving}>
              <ExternalLink className='w-4 h-4 mr-2' />
              Preview Homepage
            </Button>
          </div>
          <div className='flex items-center gap-3'>
            {hasUnsavedChanges && (
              <span className='text-sm text-amber-600 font-medium'>
                Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              size='lg'>
              <Save className='w-4 h-4 mr-2' />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
