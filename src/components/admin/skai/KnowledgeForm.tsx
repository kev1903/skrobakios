import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface KnowledgeFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface KnowledgeFormProps {
  initialData?: Partial<KnowledgeFormData>;
  onSubmit: (data: KnowledgeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const KnowledgeForm: React.FC<KnowledgeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<KnowledgeFormData>({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      category: initialData?.category || '',
      tags: initialData?.tags || []
    }
  });

  const [tagInput, setTagInput] = React.useState('');
  const tags = watch('tags');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title', { required: true })}
          placeholder="Enter knowledge title"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          {...register('category')}
          placeholder="e.g., Safety, Compliance, Best Practices"
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          {...register('content', { required: true })}
          placeholder="Enter the knowledge content..."
          rows={10}
          className="resize-y"
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add tags"
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
