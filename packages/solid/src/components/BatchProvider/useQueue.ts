import { createEffect, createSignal } from 'solid-js';
import { Queue, QueueItem } from './types';

/**
 * This hook returns a queue that can be used to batch updates.
 *
 * @param runQueue - a function that gets called when the queue is flushed
 * @internal
 *
 * @returns a Queue object
 */
export function useQueue<T>(runQueue: (items: QueueItem<T>[]) => void) {
  /*
   * Because we're using a ref above, we need some way to let Solid know when to
   * actually process the queue. We increment this number any time we mutate the
   * queue, creating a new state to trigger the effect below.
   * Using a boolean dirty flag here instead would lead to issues related to
   * automatic batching. (https://github.com/xyflow/xyflow/issues/4779)
   */
  const [serial, setSerial] = createSignal(BigInt(0));

  /*
   * A reference of all the batched updates to process before the next render. We
   * want a reference here so multiple synchronous calls to `setNodes` etc can be
   * batched together.
   */
  const queue = createQueue<T>(() => setSerial((n) => n + BigInt(1)));

  /*
   * Effects in Solid run after the render is committed to the DOM, which is similar
   * to React's layout effects.
   */
  createEffect(() => {
    const queueItems = queue.get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentSerial = serial(); // Access the signal to create a dependency

    if (queueItems.length) {
      runQueue(queueItems);
      queue.reset();
    }
  });

  return queue;
}

function createQueue<T>(cb: () => void): Queue<T> {
  let queue: QueueItem<T>[] = [];

  return {
    get: () => queue,
    reset: () => {
      queue = [];
    },
    push: (item) => {
      queue.push(item);
      cb();
    },
  };
}
