# Personame next steps

The core create → publish → take quiz → results flow is implemented on this branch. See [Core workflow](docs/CORE_WORKFLOW.md) for behavior, scoring, access controls, artwork, and test instructions.

## Verify before merging

- Walk through creating a quiz with your Google account.
- Edit earlier steps and verify targets/weights remain intact.
- Try multiple choice, slider, and scale questions in the full preview.
- Publish, open the public link, submit, and copy the result link.
- Check the creator dashboard and editing/unpublishing behavior.
- Apply the new Prisma migration to each environment before deploying the code.

## Next product work

- Creator completion analytics and archetype distributions.
- A participant’s saved result history.
- Separate published and draft versions so creators can edit without temporarily unpublishing.
- More discovery options, templates, and richer sharing previews.
- Drag-and-drop question/page ordering and additional question types.
