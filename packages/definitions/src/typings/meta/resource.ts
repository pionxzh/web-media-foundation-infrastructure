import type { IResourceTag, IGroupTypeResourceTag } from './resourceTag';
import type { PreloadLevel } from '../../constants/meta/resource';

export interface IResourceCommonFields {
  /**
   * The unique ID of this resource file, for most of the case, the value is
   * randomly generated by [Nano ID](https://zelark.github.io/nano-id-cc/) while
   * importing the resource. Some extension may use meaningful value. However,
   * this is a very special case, except developers have a specific purpose,
   * this value should always be a random ID to prevent any kind of conflict.
   */
  readonly id: string;
  /**
   * Human readable label to identity the resource file, this field is manually
   * filled by developers, developers should avoid name conflict, at lease for
   * each episode or resource group.
   *
   * Please notice if there is a resource group and a resource file with the
   * same label, Web Media Foundation selects resource groups over resource files in
   * preference.
   */
  label: string;
  /**
   * If the file is soft removed, Web Media Foundation do not remove files even if
   * developers removed the file in the Web Media Foundation Studio since the resource
   * is possible to be published in production, remove the record of these
   * resource is not safe.
   */
  removed: boolean;
  /**
   * The time of the file is removed.
   */
  removedTime: number;
  /**
   * The time of the file is imported.
   */
  readonly importTime: number;
  /**
   * The URL of the thumbnail image, this field is only used in the Web Media Foundation
   * Studio, would not be uploaded to the CDN, and would not be used by any
   * part of the Web Media Foundation.
   */
  readonly thumbnailSrc: string | null;
}

export interface IResourceFile extends IResourceCommonFields {
  /**
   * The type of this resource, for a resource file, the value should be `file`.
   */
  readonly type: 'file';
  /**
   * Use resource with the value of this field, instead this resource
   * definition.
   *
   * This should **ONLY** be available for online resource in production mode,
   * the field will appear while multiple resources are merged into one group.
   */
  redirectTo?: string;
  /**
   * A managed file means all managed fields will be locked, should never be
   * changed manually.
   *
   * For Web Media Foundation Studio, while the target file changes, extension configuration
   * not marked as `nonMergeableResourceExtensionConfiguration` and tags not end
   * with `!` will be applied to managed files.
   *
   * Mergeable field is defined in the resource processor extension of Web Media Foundation
   * Studio.
   */
  managedBy: string | null;
  /**
   * The [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
   * of this resource file.
   * For video and audio files, developers should avoid filling
   * `application/octet-stream`, and provide [codec information](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#audio_and_video_types)
   * to this field or Safari may failed to play these media.
   *
   * Web Media Foundation Studio will automatically detect the type and codec of the media
   * files, for developers that manually filling these fields, it is recommend
   * to use [this script](https://github.com/Web-Media-Foundation/studio/blob/acecdbb2444330f1504a690b7a5c45466169919d/packages/extension-sdk/src/detectVideoMime.ts)
   * to generate the MIME type with codec information for the media file.
   */
  readonly mimeType: string;
  /**
   * The [xxHash](https://www.npmjs.com/package/xxhashjs) value of the file
   * while importing.
   *
   * **This field is considered legacy**. In earlier versions of Web Media Foundation
   * Studio, files might be imported with some pre-processing process, this
   * field can help Web Media Foundation determine whether a particular file has been
   * imported even after the file is converted. But this mechanism is considered
   * to be harmful. We now process the files through an extension system. The
   * converted files are stored in the database as a new file, and the original
   * files are preserved, the new file and the original file are linked by the
   * [`managedBy`](/api/definitions/interface/IResourceFile#managedBy) field.
   */
  readonly originalHash: string;
  /**
   * The hash value of the file, Web Media Foundation provides two different hash
   * for different use cases, [xxHash](https://cyan4973.github.io/xxHash/) is a
   * faster hashing algorithm but [MD5](https://www.ietf.org/rfc/rfc1321.txt)
   * has a better compatibility since many battery-included languages have a
   * build-in MD5 implementation.
   */
  readonly convertedHash: {
    readonly xxHash: string;
    readonly md5: string;
  };
  /**
   * A map of the url of this resource, the key is the identity of the uploader,
   * this could be the name of the CDN or the name of the storage solution, like
   * build-in resource of the package.
   */
  url: Record<string, string>;
  /**
   * If this resource need to be cached:
   * - For Android / iOS / Windows / macOS client, the file will be included in
   *   the resource package, if the developer is not selecting the `bare`
   *   building solution.
   * - For Web version, the file will be cached with the [`Cache API`](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
   *   or the [`IndexedDB API`](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).
   */
  cacheToHardDisk: boolean;
  /**
   * If the resource need to be preloaded. Developers could set this field if
   * the resources need to loaded when the act point or the episode starts
   * playing. This is for providing a more complete first-screen experience,
   * to avoid the visual experience regression caused by the image loading.
   */
  preloadLevel: PreloadLevel;
  /**
   * @deprecated Legacy field, not using anywhere.
   */
  preloadTriggers: string[];
  /**
   * The episode id of this resource belongs to, we use this value to manage
   * resource preloading and offline bundle building.
   */
  episodeIds: string[];
  /**
   * If the resource is a video or an audio, a numeric value should be provided
   * to calculate [the progress and timing](/docs/technotes/tn9002-episode-core#time-calculation)
   * of the playing process.
   */
  readonly duration: number | null;
  /**
   * The resource group of this resource file belongs to, provide an empty
   * string if the resource file do not contains in any resource group.
   *
   * This is a bi-directional field, developers should maintain this field and
   * the `files` field of the resource group. Or the resource querying may not
   * working correctly, Web Media Foundation Studio did this automatically but if you are
   * writing resource definition manually, please be careful.
   */
  resourceGroupId: string;
  /**
   * Tags for smart resource selection, including the language, device type
   * definition, the format is `[field]:[value](!)`, like:
   * - `lang:en`: Resource that used for English environment.
   * - `role:video!`: The role of this resource for a video is the video
   *   channel, the tags would not be changed when the resource is managed or
   *   being merged.
   */
  tags: IResourceTag['id'][];
  /**
   * All configuration generated by Web Media Foundation Studio, could be used by the player
   * or [interface components](/docs/technotes/tn9001-project-model#:~:text=by%20building%20an-,interface%20component,-%2D%20an%20ESM%20module),
   * like the [audio backend](/docs/technotes/tn7001-audio-management) or the
   * atlas dimension information.
   */
  extensionConfigurations: Record<string, string>;
}

export interface IResourceGroup extends IResourceCommonFields {
  /**
   * The type of this resource, for a resource group, the value should be
   * `group`.
   */
  readonly type: 'group';
  /**
   * For resource group, there should never have a resource group field, this
   * typing if written for prevent writing this field.
   */
  resourceGroupId?: never;
  /**
   * The type of this resource, this is mainly for Web Media Foundation Studio to filter
   * different resource in the Resource view, not used in other places.
   */
  tags: IGroupTypeResourceTag['id'][];
  /**
   * The id of the files included in this group.
   *
   * This is a bi-directional field, developers should maintain this field and
   * the `files` field of the resource group. Or the resource querying may not
   * working correctly, Web Media Foundation Studio did this automatically but if you are
   * writing resource definition manually, please be careful.
   */
  files: string[];
}

export type IResourceItem = IResourceFile | IResourceGroup;
